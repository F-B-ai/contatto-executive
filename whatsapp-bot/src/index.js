'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { generateReply, describeApiError, MODEL } = require('./claude');
const history = require('./history');
const voice = require('./voice');

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
const VOICE_REPLIES = (process.env.VOICE_REPLIES || 'auto').toLowerCase();
const TAKEOVER_MS = parseInt(process.env.TAKEOVER_MINUTES || '60', 10) * 60 * 1000;
const FALLBACK_REPLY =
  'Scusami, in questo momento ho un problema tecnico 🙏 Riprova tra qualche minuto, oppure Francesco ti risponderà personalmente appena possibile.';

// Stato in memoria
const pausedUntil = new Map(); // chatId -> timestamp (Infinity = pausa manuale)
const pending = new Map(); // chatId -> { timer, texts: [] }
const botSentIds = new Set(); // id dei messaggi inviati dal bot (per non auto-pausarsi)

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '..', '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
  console.log('[bot] Comandi (da inviare TU nella chat): !bot off, !bot on, !reset');
});

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

    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const chatId = chat.id._serialized;
    if (isPaused(chatId)) return;

    const isVoiceMsg = msg.type === 'ptt' || msg.type === 'audio';
    let body = (msg.body || '').trim();

    if (isVoiceMsg && voice.isConfigured()) {
      try {
        const media = await msg.downloadMedia();
        const transcript = await voice.transcribeVoice(media.data, media.mimetype);
        body = transcript
          ? `[Messaggio vocale del contatto, trascrizione automatica] ${transcript}`
          : '[Il contatto ha inviato un vocale, ma la trascrizione è risultata vuota]';
      } catch (err) {
        console.error('[bot] Trascrizione del vocale fallita:', err.message);
        body = '[Il contatto ha inviato un vocale che non è stato possibile trascrivere]';
      }
    }
    if (!body) {
      body = `[Il contatto ha inviato un contenuto di tipo "${msg.type}" che non puoi leggere]`;
    }

    // Raccoglie i messaggi ravvicinati e risponde una volta sola (debounce)
    let entry = pending.get(chatId);
    if (!entry) {
      entry = { timer: null, texts: [], wantsVoice: false };
      pending.set(chatId, entry);
    }
    entry.wantsVoice = entry.wantsVoice || isVoiceMsg;
    entry.texts.push(body);
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => respond(chat, chatId), DEBOUNCE_MS);
  } catch (err) {
    console.error('[bot] Errore nella gestione del messaggio:', err);
  }
});

async function respond(chat, chatId) {
  const entry = pending.get(chatId);
  pending.delete(chatId);
  if (!entry || entry.texts.length === 0) return;
  if (isPaused(chatId)) return;

  const userText = entry.texts.join('\n');
  history.append(chatId, 'user', userText);

  const replyWithVoice =
    voice.isConfigured() &&
    (VOICE_REPLIES === 'always' || (VOICE_REPLIES === 'auto' && entry.wantsVoice));

  try {
    // indicatore "sta registrando…" / "sta scrivendo…" (solo cosmetico)
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

  try {
    let sent = null;
    if (replyWithVoice) {
      try {
        const audio = await voice.textToVoice(reply);
        const media = new MessageMedia(audio.mimetype, audio.base64);
        sent = await chat.sendMessage(media, { sendAudioAsVoice: true });
      } catch (err) {
        console.error('[bot] Sintesi vocale fallita, invio la risposta come testo:', err.message);
      }
    }
    if (!sent) {
      sent = await chat.sendMessage(reply);
    }
    botSentIds.add(sent.id._serialized);
    console.log(`[bot] Risposto a ${chatId}${sent.hasMedia ? ' (vocale)' : ''}`);
  } catch (err) {
    console.error('[bot] Invio messaggio fallito:', err.message);
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
  if (!chatId || chatId === 'status@broadcast' || chatId.endsWith('@g.us')) return;

  const body = (msg.body || '').trim().toLowerCase();

  if (body === '!bot off') {
    pausedUntil.set(chatId, Infinity);
    console.log(`[bot] Disattivato manualmente in ${chatId}`);
    return;
  }
  if (body === '!bot on') {
    pausedUntil.delete(chatId);
    console.log(`[bot] Riattivato in ${chatId}`);
    return;
  }
  if (body === '!reset') {
    history.clear(chatId);
    pausedUntil.delete(chatId);
    console.log(`[bot] Conversazione azzerata per ${chatId}`);
    return;
  }

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
