# Collegare il bot server a Firestore

Perché la web app mostri le conversazioni reali e possa comandare il bot, il bot su Google Cloud deve leggere/scrivere su **Firebase Firestore**. Questa è una modifica al codice del bot (`whatsapp-bot/`).

## 1. Installa Firebase Admin nel bot

Sul server, nella cartella del bot:

```bash
cd ~/contatto-executive/whatsapp-bot
npm install firebase-admin
```

## 2. Scarica la chiave del "service account"

1. Firebase Console → ⚙️ Impostazioni progetto → scheda **Account di servizio**
2. Tocca **Genera nuova chiave privata** → scarica il file JSON
3. Caricalo sul server come `whatsapp-bot/serviceAccountKey.json`
   (⚠️ NON committarlo su GitHub — è già in `.gitignore` come segreto)

## 3. Aggiungi Firestore al bot

Crea un file `whatsapp-bot/src/firestore.js`:

```javascript
'use strict';
// Salvataggio conversazioni su Firebase Firestore.
// Se il file serviceAccountKey.json non c'è, il modulo si disattiva da solo
// e il bot continua a funzionare normalmente (solo senza sync con la web app).

let db = null;
let admin = null;

try {
  admin = require('firebase-admin');
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  db = admin.firestore();
  console.log('[firestore] collegato: le conversazioni si sincronizzano con la web app');
} catch (e) {
  console.log('[firestore] non configurato (manca serviceAccountKey.json): salto la sync');
}

function isEnabled() { return Boolean(db); }

// Salva un messaggio (in arrivo o inviato) e aggiorna il riepilogo della chat.
async function logMessage(chatId, { sender, text, contactName, status }) {
  if (!db) return;
  try {
    const ts = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('bot_conversations').doc(chatId)
      .collection('messages').add({ sender, text, timestamp: ts });
    await db.collection('bot_conversations').doc(chatId).set({
      contactName: contactName || 'Contatto',
      contactPhone: chatId,
      lastMessage: text,
      lastMessageTime: ts,
      status: status || 'new_lead',
      messageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: ts,
    }, { merge: true });
  } catch (e) {
    console.error('[firestore] errore salvataggio:', e.message);
  }
}

// Ascolta i comandi inviati dalla web app (pausa / riattiva).
// onCommand(action, chatId) viene chiamato per ogni nuovo comando.
function listenCommands(onCommand) {
  if (!db) return;
  db.collection('bot_commands').where('status', '==', 'pending')
    .onSnapshot((snap) => {
      snap.docChanges().forEach((ch) => {
        if (ch.type === 'added') {
          const c = ch.doc.data();
          try { onCommand(c.action, c.chatId || null); } catch (_) {}
          ch.doc.ref.update({ status: 'executed' }).catch(() => {});
        }
      });
    });
}

module.exports = { isEnabled, logMessage, listenCommands };
```

## 4. Usa Firestore in `src/index.js`

In cima al file, dopo gli altri `require`:

```javascript
const firestore = require('./firestore');
```

Quando **ricevi** un messaggio dal contatto (dove già leggi `msg.body`), aggiungi:

```javascript
firestore.logMessage(chatId, {
  sender: 'user',
  text: testoDelMessaggio,          // il testo ricevuto
  contactName: nomeContatto,         // il nome del contatto se disponibile
  status: eUnCliente ? 'client' : 'new_lead',
});
```

Quando **invii** la risposta del bot (dopo `sendMessage`), aggiungi:

```javascript
firestore.logMessage(chatId, {
  sender: 'bot',
  text: rispostaDelBot,
});
```

Per far obbedire il bot ai comandi della web app, all'avvio (dove crei il client) aggiungi:

```javascript
firestore.listenCommands((action, chatId) => {
  if (action === 'off') {
    botAttivo = false;
    console.log('[bot] messo in pausa dalla web app');
  } else if (action === 'on') {
    botAttivo = true;
    console.log('[bot] riattivato dalla web app');
  }
});
```

(adatta `botAttivo` alla variabile che già usi per il pausa/attiva del bot).

## 5. Riavvia il bot

```bash
pm2 restart whatsapp-bot   # se usi pm2
# oppure
npm start
```

Da ora, ogni messaggio che passa dal bot appare nella web app **in tempo reale**, e i pulsanti pausa/riattiva della web app comandano il bot.

## Note

- Il modulo `firestore.js` è **opzionale**: se manca `serviceAccountKey.json`, il bot funziona come prima senza sync. Così non rischi di rompere nulla.
- `serviceAccountKey.json` è un segreto: è già escluso da Git. Non condividerlo.
- I nomi dei campi (`sender`, `text`, `status`, ecc.) devono restare uguali a quelli che la web app si aspetta — non cambiarli.
