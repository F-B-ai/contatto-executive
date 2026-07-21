# Bot WhatsApp con AI — ESSĒRE

Bot che risponde automaticamente ai messaggi WhatsApp usando l'AI di Claude (Anthropic), pensato per accogliere e qualificare i contatti che arrivano dalla landing page del programma **Executive Performance Reset**.

> ⚠️ **Avvertenza importante**: questo bot usa [whatsapp-web.js](https://wwebjs.dev/), una libreria **non ufficiale** che collega il bot al tuo account come se fosse "WhatsApp Web". È contro i termini di servizio di WhatsApp e c'è un **rischio concreto di ban del numero**. Consiglio vivamente di provarlo prima con un numero secondario, non con il numero di lavoro principale.

## Cosa fa

- Risponde ai messaggi privati (mai nei gruppi) con risposte AI naturali in italiano, seguendo la personalità definita in `config/system-prompt.md`.
- Ricorda la conversazione con ogni contatto (storico salvato in `data/conversations.json`).
- Raggruppa i messaggi ravvicinati di un contatto e risponde una volta sola.
- **Si mette in pausa da solo** in una chat quando rispondi tu manualmente (default: 60 minuti), così non ti parla sopra.
- Mostra l'indicatore "sta scrivendo…" (o "sta registrando…") prima di rispondere.
- **Risposte vocali** (opzionale): capisce i vocali dei contatti (trascrizione automatica) e risponde con veri messaggi vocali usando una voce femminile naturale in italiano — la tua "segretaria virtuale".

## Comandi (li invii tu, dal tuo telefono, dentro la chat)

| Comando    | Effetto                                             |
|------------|-----------------------------------------------------|
| `!bot off` | Disattiva il bot in quella chat (finché non lo riattivi) |
| `!bot on`  | Riattiva il bot in quella chat                      |
| `!reset`   | Azzera la memoria della conversazione in quella chat |

## Requisiti

- Node.js 18 o superiore
- Una chiave API Anthropic ([console.anthropic.com](https://console.anthropic.com/settings/keys))

## Installazione

```bash
cd whatsapp-bot
npm install
cp .env.example .env
# apri .env e inserisci la tua ANTHROPIC_API_KEY
```

## Avvio

```bash
npm start
```

Al primo avvio compare un **QR code nel terminale**: scansionalo dal telefono con **WhatsApp → Impostazioni → Dispositivi collegati → Collega un dispositivo**. La sessione viene salvata in `.wwebjs_auth/`, quindi ai riavvii successivi non serve più scansionare.

Il bot deve restare in esecuzione per rispondere: su un server puoi usare [pm2](https://pm2.keymetrics.io/) (`pm2 start src/index.js --name whatsapp-bot`).

### Collegamento senza QR (da iPhone o server remoto)

Se gestisci il server dallo stesso telefono che ha WhatsApp (es. via SSH dall'iPhone con un'app come Termius), non puoi scansionare il QR che appare sullo schermo del telefono stesso. In quel caso usa il **codice di abbinamento**:

1. Nel file `.env` imposta `PAIRING_PHONE_NUMBER` con il numero WhatsApp del bot, solo cifre e con prefisso internazionale (es. `393331234567`).
2. Avvia il bot: nel terminale compare un **codice di 8 caratteri** invece del QR.
3. Su WhatsApp: **Impostazioni → Dispositivi collegati → Collega un dispositivo → "Collega con numero di telefono"** e digita il codice.

Una volta collegato, la sessione resta salvata e ai riavvii non serve ripetere la procedura. Ricorda: il bot gira sul computer/server, non sull'iPhone — il telefono serve solo per autorizzare il collegamento e, volendo, per controllare il server via SSH.

## Distribuzione 24/7 su un server

Per non dover tenere il tuo computer sempre acceso, il bot può girare su un piccolo server sempre attivo (VPS). Costa qualche euro al mese (es. [Hetzner Cloud](https://www.hetzner.com/cloud/), pianoCX22 economico) e resta collegato a WhatsApp senza interruzioni.

**1. Crea il server**

Su [hetzner.com](https://www.hetzner.com/cloud/) (o DigitalOcean, o un altro provider) crea un account e un nuovo server: sistema operativo **Ubuntu 24.04**, posizione europea, imposta una password per l'utente `root`. Al termine annota l'**indirizzo IP** del server.

**2. Collegati al server** (da PowerShell sul tuo PC)

```bash
ssh root@TUO_INDIRIZZO_IP
```

Inserisci la password quando richiesto (non vedrai nulla mentre digiti, è normale).

**3. Installa Node.js e git sul server**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git
```

**4. Scarica il codice**

```bash
git clone https://github.com/F-B-ai/contatto-executive.git
cd contatto-executive/whatsapp-bot
```

**5. Installa le dipendenze e configura**

```bash
npm install
cp .env.example .env
nano .env
```

Inserisci `ANTHROPIC_API_KEY`, poi salva con `Ctrl+O`, Invio, ed esci con `Ctrl+X`.

**6. Primo avvio, per collegare WhatsApp**

```bash
npm start
```

Il QR code compare direttamente nel terminale SSH: scansionalo come al solito. Una volta visto `[bot] Pronto!`, ferma con `Ctrl+C` (su Linux non serve `PUPPETEER_HEADLESS` né i flag extra per Windows: il browser headless funziona normalmente).

**7. Avvialo in background, permanente**

```bash
npm install -g pm2
pm2 start src/index.js --name whatsapp-bot
pm2 save
pm2 startup
```

L'ultimo comando stampa una riga da copiare e incollare: serve a far ripartire automaticamente il bot se il server si riavvia.

**Comandi utili una volta installato:**

| Comando | Effetto |
|---|---|
| `pm2 logs whatsapp-bot` | Vedi i log in diretta |
| `pm2 restart whatsapp-bot` | Riavvia il bot |
| `pm2 stop whatsapp-bot` | Ferma il bot |

**Per aggiornare il codice in futuro:**

```bash
cd ~/contatto-executive/whatsapp-bot
git pull
npm install
pm2 restart whatsapp-bot
```

## Risposte vocali (la "segretaria virtuale")

Con un account [ElevenLabs](https://elevenlabs.io) il bot parla e ascolta:

- **Ascolta**: i vocali dei contatti vengono trascritti automaticamente, così l'AI capisce cosa hanno detto e risponde nel merito.
- **Parla**: le risposte vengono inviate come veri messaggi vocali WhatsApp (con la forma d'onda), sintetizzati con la voce che scegli.

Per attivarle:

1. Crea un account su [elevenlabs.io](https://elevenlabs.io) (c'è un piano gratuito, ~10 minuti di voce al mese, per provare; i piani a pagamento partono da ~5$/mese).
2. Copia la chiave API in `.env` → `ELEVENLABS_API_KEY`.
3. (Facoltativo) Scegli la voce della segretaria dalla [Voice Library](https://elevenlabs.io/app/voice-library): apri una voce, copia il suo **Voice ID** e incollalo in `ELEVENLABS_VOICE_ID`. Il default è "Sarah", una voce femminile che parla bene l'italiano. Con i piani a pagamento puoi anche **clonare una voce specifica**.
4. Scegli quando parlare con `VOICE_REPLIES`: `auto` (a voce solo quando il contatto manda vocali — consigliato), `always` (sempre a voce) o `off`.

Se la sintesi vocale fallisce per qualsiasi motivo (credito esaurito, rete), il bot ripiega automaticamente sulla risposta scritta: non resta mai in silenzio.

## Personalizzazione

- **Personalità e regole del bot**: modifica `config/system-prompt.md` (è testo semplice, riavvia il bot dopo le modifiche).
- **Modello e costi**: il default è `claude-opus-4-8` ($5/$25 per milione di token in input/output). Per risparmiare imposta in `.env` `CLAUDE_MODEL=claude-sonnet-5` oppure `claude-haiku-4-5`. Una risposta tipica costa una frazione di centesimo, ma i costi crescono con il volume di messaggi.
- Altre opzioni (tempi di pausa, memoria, debounce): vedi `.env.example`.

## Note

- Il file `.env`, la sessione WhatsApp (`.wwebjs_auth/`) e lo storico conversazioni (`data/`) sono esclusi da git: contengono dati sensibili e non vanno mai committati.
- Se il bot risponde a qualcosa che non dovrebbe, aggiorna le "Regole ferree" in `config/system-prompt.md`.
