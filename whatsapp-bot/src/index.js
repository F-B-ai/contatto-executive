'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { generateReply, describeApiError, MODEL } = require('./claude');
const history = require('./history');
const voice = require('./voice');
const contacts = require('./contacts');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ERRORE: manca ANTHROPIC_API_KEY. Copia .env.example in .env e inserisci la tua chiave.');
  process.exit(1);
}

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, '..', 'config', 'system-prompt.md'),
  'utf8'
);

const DEBOUNCE_MS = parseInt(process.env.DEBOUNCE_SECONDS || '5', 10) * 1000;
// Risposte vocali: 'auto' = a voce solo se il contatto manda vocali,
// 'always' = sempre a voce, 'off' = solo testo
// Default 'off': Valentina risponde solo in testo. Si può riattivare la voce
// da .env con VOICE_REPLIES=auto (a voce se il contatto manda un vocale) o
// VOICE_REPLIES=always (sempre a voce).
const VOICE_REPLIES = (process.env.VOICE_REPLIES || 'off').toLowerCase();
// I vocali in ARRIVO sono affetti da un bug upstream di WhatsApp Web (il
// download del media fallisce): finché non viene corretto, di default NON
// proviamo a trascriverli e chiediamo al contatto di scrivere in testo.
// Quando la libreria sarà aggiornata, imposta VOICE_TRANSCRIBE=on in .env.
const VOICE_TRANSCRIBE = (process.env.VOICE_TRANSCRIBE || 'off').toLowerCase() === 'on';
const TAKEOVER_MS = parseInt(process.env.TAKEOVER_MINUTES || '60', 10) * 60 * 1000;
const FALLBACK_REPLY =
  'Scusami, in questo momento ho un problema tecnico 🙏 Riprova tra qualche minuto, oppure Francesco ti risponderà personalmente appena possibile.';
// Nota interna passata al modello quando arriva un vocale che non possiamo
// ascoltare: fa sì che Valentina chieda cortesemente di scrivere in testo.
const ASK_TO_WRITE =
  '[Il contatto ha inviato un messaggio vocale. Spiegagli con gentilezza che al momento non riesci ad ascoltare i vocali e chiedigli cortesemente di scriverti il messaggio in testo, così puoi aiutarlo subito.]';

// All'avvio, rispondi ai messaggi rimasti in sospeso (arrivati mentre il bot
// era spento). CATCHUP_HOURS = quanto indietro guardare (ore). Disattivabile
// con CATCHUP_ON_START=off in .env.
const CATCHUP_ON_START = (process.env.CATCHUP_ON_START || 'on').toLowerCase() !== 'off';
const CATCHUP_HOURS = parseInt(process.env.CATCHUP_HOURS || '24', 10);

// Stato in memoria
const pausedUntil = new Map(); // chatId -> timestamp (Infinity = pausa manuale)
const pending = new Map(); // chatId -> { timer, texts: [] }
const botSentIds = new Set(); // id dei messaggi inviati dal bot (per non auto-pausarsi)
const lastBotSendAt = new Map(); // chatId -> timestamp dell'ultimo invio del bot
const recentBotTexts = []; // { text, at } testi inviati di recente dal bot

// Riconosce i messaggi del bot dal contenuto: robusto anche quando gli
// indirizzi @lid non combaciano tra messaggio in arrivo e in uscita.
function rememberBotText(text) {
  const t = (text || '').trim();
  if (!t) return;
  recentBotTexts.push({ text: t, at: Date.now() });
  const cutoff = Date.now() - 60000;
  while (recentBotTexts.length && recentBotTexts[0].at < cutoff) recentBotTexts.shift();
}

function isRecentBotText(text) {
  const t = (text || '').trim();
  if (!t) return false;
  const cutoff = Date.now() - 60000;
  return recentBotTexts.some((e) => e.at >= cutoff && e.text === t);
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '..', '.wwebjs_auth') }),
  // NB: niente override di webVersionCache. Un tentativo di forzare una
  // versione precedente (per aggirare il bug upstream di getChatById, issue
  // #201838) è stato scartato: l'intercettazione della richiesta della
  // pagina che quel meccanismo richiede si è rivelata instabile su Windows
  // e causava di nuovo "Execution context was destroyed" già all'avvio.
  // Questa è la configurazione più stabile trovata finché la libreria non
  // pubblica una correzione ufficiale.
  puppeteer: {
    // PUPPETEER_HEADLESS=false in .env apre la finestra di Chromium invece di
    // tenerla nascosta: utile per capire a video perché l'avvio si blocca.
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    // Timeout del protocollo più alto (default puppeteer 180s). Su VM con poca
    // RAM (es. 1 GB) l'avvio di Chromium usa la swap ed è lento: senza questo
    // margine l'inject di whatsapp-web.js va in "ProtocolError: Runtime.evaluate
    // timed out" e il bot crasha subito dopo l'autenticazione. Regolabile da
    // .env con PUPPETEER_PROTOCOL_TIMEOUT (millisecondi).
    protocolTimeout: parseInt(process.env.PUPPETEER_PROTOCOL_TIMEOUT || '300000', 10),
    // Flag extra oltre a --no-sandbox: risolvono crash di Chromium tipici su
    // Windows (GPU/driver problematici) che si manifestano come "Execution
    // context was destroyed" subito dopo l'avvio; gli ultimi riducono il
    // consumo di memoria su server piccoli (1 GB di RAM).
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-features=site-per-process,TranslateUI',
      '--js-flags=--max-old-space-size=512',
    ],
  },
});

// Se PAIRING_PHONE_NUMBER è impostato, il collegamento avviene con un codice
// da digitare su WhatsApp invece del QR code (comodo da iPhone / server remoto).
const PAIRING_NUMBER = (process.env.PAIRING_PHONE_NUMBER || '').replace(/\D/g, '');
let pairingCodeRequested = false;

client.on('qr', async (qr) => {
  if (PAIRING_NUMBER) {
    if (pairingCodeRequested) return;
    pairingCodeRequested = true;
    try {
      const code = await client.requestPairingCode(PAIRING_NUMBER);
      const pretty = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      console.log('\n================================================');
      console.log(`  Codice di abbinamento WhatsApp: ${pretty}`);
      console.log('================================================');
      console.log('Su WhatsApp: Impostazioni → Dispositivi collegati →');
      console.log('Collega un dispositivo → "Collega con numero di telefono"');
      console.log('e digita il codice qui sopra.\n');
    } catch (err) {
      console.error('[bot] Richiesta del codice di abbinamento fallita:', err.message);
      console.error(
        '[bot] Controlla PAIRING_PHONE_NUMBER nel file .env: solo cifre, con prefisso internazionale (es. 393331234567).'
      );
      pairingCodeRequested = false; // riprova al prossimo evento QR
    }
    return;
  }

  console.log('\nScansiona questo QR code con WhatsApp (Impostazioni → Dispositivi collegati):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('[bot] Autenticato: sessione salvata in .wwebjs_auth/'));
client.on('auth_failure', (msg) => console.error('[bot] Autenticazione fallita:', msg));
client.on('disconnected', (reason) => console.error('[bot] Disconnesso:', reason));

client.on('ready', () => {
  console.log(`[bot] Pronto! Rispondo con il modello ${MODEL}.`);
  console.log('[bot] Comandi (da inviare TU nella chat): !bot off, !bot on, !reset, !cliente, !lead');
  catchUpUnanswered().catch((err) =>
    console.error('[bot] Recupero dei messaggi in sospeso fallito:', err.message)
  );
});

// Determina se un contatto è un allievo già seguito da Francesco o un lead
// nuovo. Priorità: eccezione manuale (!cliente / !lead) > contatto salvato
// in rubrica (isMyContact) = cliente > altrimenti lead. In caso di errore
// nel controllo, si assume "lead": è il fallback più prudente, perché il
// percorso di qualifica lead è lo scopo principale del bot.
async function resolveContactStatus(msg, chatId) {
  const manual = contacts.getOverride(chatId);
  if (manual) return manual;

  try {
    const contact = await msg.getContact();
    return contact.isMyContact ? 'cliente' : 'lead';
  } catch (err) {
    console.error('[bot] Impossibile verificare se il contatto è in rubrica, considerato lead:', err.message);
    return 'lead';
  }
}

// Scarica il media di un messaggio con qualche tentativo: la funzione interna
// di WhatsApp Web a volte fallisce con l'errore "r" (stesso bug upstream di
// getChatById), ma spesso al tentativo successivo va a buon fine.
async function downloadMediaWithRetry(msg, attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const media = await msg.downloadMedia();
      if (media && media.data) return media;
      lastErr = new Error('media vuoto');
    } catch (err) {
      lastErr = err;
    }
    // attesa crescente tra un tentativo e l'altro (0.6s, 1.2s, 1.8s, ...)
    await new Promise((r) => setTimeout(r, 600 * (i + 1)));
  }
  throw lastErr || new Error('download del media non riuscito');
}

function isPaused(chatId) {
  const until = pausedUntil.get(chatId);
  if (!until) return false;
  if (Date.now() >= until) {
    pausedUntil.delete(chatId);
    return false;
  }
  return true;
}

// Messaggi in arrivo dai contatti
client.on('message', async (msg) => {
  try {
    if (msg.from === 'status@broadcast') return;

    // Evitiamo msg.getChat(): su alcune versioni recenti di WhatsApp Web va
    // in errore "r: r" (getChatById) e fa cadere il messaggio. Ricaviamo tutto
    // da msg.from, che è già disponibile e non richiede chiamate interne.
    // Rispondiamo solo alle chat 1:1 reali: saltiamo gruppi, canali/newsletter
    // e broadcast, non sono conversazioni a cui Valentina deve rispondere.
    if (
      msg.from.endsWith('@g.us') ||
      msg.from.endsWith('@newsletter') ||
      msg.from.endsWith('@broadcast')
    )
      return;

    const chatId = msg.from;
    if (isPaused(chatId)) return;

    const isVoiceMsg = msg.type === 'ptt' || msg.type === 'audio';
    let body = (msg.body || '').trim();
    let transcriptionOk = false;

    if (isVoiceMsg) {
      if (voice.isConfigured() && VOICE_TRANSCRIBE) {
        try {
          const media = await downloadMediaWithRetry(msg);
          const transcript = await voice.transcribeVoice(media.data, media.mimetype);
          if (transcript) {
            body = `[Messaggio vocale del contatto, trascrizione automatica] ${transcript}`;
            transcriptionOk = true;
          } else {
            body = ASK_TO_WRITE;
          }
        } catch (err) {
          console.error('[bot] Trascrizione del vocale fallita:', err.message);
          body = ASK_TO_WRITE;
        }
      } else {
        // Trascrizione disattivata (bug upstream sul download): rispondiamo
        // subito chiedendo di scrivere, senza tentativi di scaricamento.
        body = ASK_TO_WRITE;
      }
    }
    if (!body) {
      body = `[Il contatto ha inviato un contenuto di tipo "${msg.type}" che non puoi leggere]`;
    }

    // Raccoglie i messaggi ravvicinati e risponde una volta sola (debounce)
    let entry = pending.get(chatId);
    if (!entry) {
      entry = { timer: null, texts: [], wantsVoice: false, contactStatus: null };
      pending.set(chatId, entry);
    }
    if (!entry.contactStatus) {
      entry.contactStatus = await resolveContactStatus(msg, chatId);
    }
    // Rispondiamo a voce solo se abbiamo davvero capito il vocale del contatto.
    // Se non riusciamo a leggerlo (bug upstream), meglio rispondere in testo
    // chiedendo di scrivere, invece di mandare un vocale che dice "scrivimi".
    entry.wantsVoice = entry.wantsVoice || transcriptionOk;
    entry.texts.push(body);
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => respond(chatId), DEBOUNCE_MS);
  } catch (err) {
    console.error('[bot] Errore nella gestione del messaggio:', err);
  }
});

async function respond(chatId) {
  const entry = pending.get(chatId);
  pending.delete(chatId);
  if (!entry || entry.texts.length === 0) return;
  if (isPaused(chatId)) return;

  const statusTag =
    entry.contactStatus === 'cliente'
      ? '[Contatto salvato in rubrica: probabile allievo già seguito da Francesco]'
      : '[Contatto non salvato in rubrica: probabile nuovo lead]';
  const userText = `${statusTag}\n${entry.texts.join('\n')}`;
  history.append(chatId, 'user', userText);

  const replyWithVoice =
    voice.isConfigured() &&
    (VOICE_REPLIES === 'always' || (VOICE_REPLIES === 'auto' && entry.wantsVoice));

  try {
    // indicatore "sta registrando…" / "sta scrivendo…" (solo cosmetico).
    // Richiede l'oggetto chat, che può fallire per il bug getChatById: se
    // succede lo ignoriamo, non è essenziale per rispondere.
    const chat = await client.getChatById(chatId);
    if (replyWithVoice) await chat.sendStateRecording();
    else await chat.sendStateTyping();
  } catch {}

  let reply;
  try {
    reply = await generateReply(history.get(chatId), SYSTEM_PROMPT);
  } catch (err) {
    console.error('[bot]', describeApiError(err));
    reply = FALLBACK_REPLY;
  }

  if (!reply) return;

  history.append(chatId, 'assistant', reply);

  // Segna che il bot sta per inviare in questa chat: serve a riconoscere il
  // proprio messaggio quando ritorna come evento, evitando la falsa "presa in
  // carico manuale" anche quando l'id dell'inviato non è disponibile.
  lastBotSendAt.set(chatId, Date.now());
  rememberBotText(reply);

  try {
    let sent = null;
    let voiceSent = false;
    if (replyWithVoice) {
      try {
        const audio = await voice.textToVoice(reply);
        const media = new MessageMedia(audio.mimetype, audio.base64);
        sent = await client.sendMessage(chatId, media, { sendAudioAsVoice: true });
        voiceSent = true; // il vocale è partito (sent può essere undefined)
      } catch (err) {
        console.error('[bot] Sintesi vocale fallita, invio la risposta come testo:', err.message);
      }
    }
    if (!voiceSent && !sent) {
      sent = await client.sendMessage(chatId, reply);
    }
    // Con i nuovi indirizzi @lid la libreria a volte invia il messaggio ma
    // restituisce undefined: registriamo l'id solo se disponibile, senza
    // andare in errore. La falsa presa in carico è evitata da lastBotSendAt.
    if (sent && sent.id && sent.id._serialized) {
      botSentIds.add(sent.id._serialized);
    }
    lastBotSendAt.set(chatId, Date.now());
    console.log(`[bot] Risposto a ${chatId}`);
  } catch (err) {
    console.error('[bot] Invio messaggio fallito:', err.message);
  }
}

// Converte un messaggio in arrivo nel testo da passare al modello.
function messageToBody(msg) {
  if (msg.type === 'ptt' || msg.type === 'audio') return ASK_TO_WRITE;
  const text = (msg.body || '').trim();
  return text || `[Il contatto ha inviato un contenuto di tipo "${msg.type}" che non puoi leggere]`;
}

// All'avvio risponde ai messaggi rimasti in sospeso: chat 1:1 con messaggi non
// letti, il cui ultimo messaggio è del contatto e recente (entro CATCHUP_HOURS).
// Tutto avvolto in try/catch: se WhatsApp Web non restituisce le chat (stesso
// bug upstream), la funzione si limita a saltare senza bloccare il bot.
async function catchUpUnanswered() {
  if (!CATCHUP_ON_START) return;

  let chats;
  try {
    chats = await client.getChats();
  } catch (err) {
    console.error('[bot] Non riesco a leggere le chat per gli arretrati:', err.message);
    return;
  }

  const cutoff = Date.now() - CATCHUP_HOURS * 60 * 60 * 1000;
  let answered = 0;

  for (const chat of chats) {
    try {
      if (chat.isGroup) continue;
      const chatId = chat.id && chat.id._serialized;
      if (
        !chatId ||
        chatId.endsWith('@g.us') ||
        chatId.endsWith('@newsletter') ||
        chatId.endsWith('@broadcast')
      )
        continue;
      if (!chat.unreadCount || chat.unreadCount < 1) continue;
      if (isPaused(chatId)) continue;

      const last = chat.lastMessage;
      if (!last || last.fromMe) continue; // già risposto / ultimo msg nostro
      if (last.timestamp && last.timestamp * 1000 < cutoff) continue; // troppo vecchio

      let messages = [];
      try {
        messages = await chat.fetchMessages({ limit: Math.min(chat.unreadCount, 10) });
      } catch {
        messages = [last];
      }
      const inbound = messages.filter((m) => !m.fromMe);
      if (!inbound.length) continue;

      const status = await resolveContactStatus(last, chatId);
      pending.set(chatId, {
        timer: null,
        texts: inbound.map(messageToBody),
        wantsVoice: false,
        contactStatus: status,
      });
      await respond(chatId);
      answered++;
      await new Promise((r) => setTimeout(r, 1500)); // piccola pausa tra le chat
    } catch (err) {
      console.error('[bot] Errore rispondendo a una chat in sospeso:', err.message);
    }
  }

  if (answered > 0) {
    console.log(`[bot] Risposto a ${answered} conversazione/i rimaste in sospeso.`);
  }
}

// Messaggi inviati DA TE (comandi e presa in carico manuale)
client.on('message_create', (msg) => {
  if (!msg.fromMe) return;
  // Attende un attimo perché l'id del messaggio del bot venga registrato
  setTimeout(() => {
    handleOwnerMessage(msg).catch((err) =>
      console.error('[bot] Errore nella gestione del messaggio proprio:', err)
    );
  }, 1500);
});

async function handleOwnerMessage(msg) {
  const id = msg.id._serialized;
  if (botSentIds.has(id)) {
    botSentIds.delete(id);
    return; // messaggio inviato dal bot stesso
  }

  const chatId = msg.to;
  if (
    !chatId ||
    chatId === 'status@broadcast' ||
    chatId.endsWith('@g.us') ||
    chatId.endsWith('@newsletter') ||
    chatId.endsWith('@broadcast')
  )
    return;

  const body = (msg.body || '').trim().toLowerCase();

  // Comandi del titolare: eseguono un'azione e basta (non fanno scattare la
  // presa in carico manuale). Il messaggio-comando viene poi cancellato per
  // tutti, così il contatto non lo vede in chat.
  const commands = {
    '!bot off': () => {
      pausedUntil.set(chatId, Infinity);
      console.log(`[bot] Disattivato manualmente in ${chatId}`);
    },
    '!bot on': () => {
      pausedUntil.delete(chatId);
      console.log(`[bot] Riattivato in ${chatId}`);
    },
    '!reset': () => {
      history.clear(chatId);
      pausedUntil.delete(chatId);
      console.log(`[bot] Conversazione azzerata per ${chatId}`);
    },
    '!cliente': () => {
      contacts.setOverride(chatId, 'cliente');
      console.log(`[bot] ${chatId} segnato manualmente come allievo/cliente`);
    },
    '!lead': () => {
      contacts.setOverride(chatId, 'lead');
      console.log(`[bot] ${chatId} segnato manualmente come nuovo lead`);
    },
  };

  if (commands[body]) {
    commands[body]();
    try {
      await msg.delete(true); // cancella il comando per tutti
    } catch (err) {
      console.error('[bot] Non sono riuscito a cancellare il messaggio-comando:', err.message);
    }
    return;
  }

  // Non scambiare per "presa in carico manuale" un messaggio inviato dal bot
  // stesso. Primo controllo, il più affidabile: il testo coincide con una
  // risposta appena inviata dal bot (funziona anche se gli indirizzi @lid non
  // combaciano). Secondo controllo: il bot ha inviato in questa chat da poco.
  if (isRecentBotText(msg.body)) return;
  const lastSend = lastBotSendAt.get(chatId);
  if (lastSend && Date.now() - lastSend < 12000) return;

  // Hai risposto tu di persona: il bot si mette in pausa in questa chat
  pausedUntil.set(chatId, Date.now() + TAKEOVER_MS);
  console.log(
    `[bot] Presa in carico manuale rilevata in ${chatId}: bot in pausa per ${TAKEOVER_MS / 60000} minuti`
  );
}

client.initialize().catch((err) => {
  console.error('[bot] Avvio fallito:', err.message);
  console.error('[bot] Controlla la connessione a internet e riprova con: npm start');
  process.exit(1);
});
