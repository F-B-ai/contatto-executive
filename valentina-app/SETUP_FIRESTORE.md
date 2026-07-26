# Integrazione Firebase + Bot Valentina Server

Come collegare il bot su Google Cloud con l'app iOS/iPad.

## Architettura

```
iPhone/iPad
    ↓
Valentina App (React Native)
    ↓
Firebase Firestore (live data)
    ↓
Bot Server (Google Cloud)
```

## Step 1: Configura Firebase Project

### Crea un nuovo progetto

1. Vai su https://console.firebase.google.com
2. Clicca "Add project"
3. Dai un nome (es. "valentina-bot-manager")
4. Disabilita Google Analytics
5. Crea il progetto

### Copia le credenziali

1. Nel progetto Firebase, clicca l'icona "Impostazioni" in alto a sinistra
2. Vai a "Project settings"
3. Scorri fino a "Your apps"
4. Clicca "Web" (se non c'è, clicca "Add app" e scegli Web)
5. Copia tutto il config e salvalo in `lib/firebase.ts`

### Abilita Firestore

1. Nel menu a sinistra, vai a "Firestore Database"
2. Clicca "Create database"
3. Scegli "Start in test mode"
4. Scegli una zona geografica (es. eur3 per Europa)
5. Crea il database

### Abilita Autenticazione

1. Nel menu a sinistra, vai a "Authentication"
2. Clicca "Get started"
3. Vai a "Sign-in method"
4. Abilita "Email/Password"
5. Vai a "Users" e crea un utente di prova

### Imposta Firestore Rules (test)

Nel database Firestore, vai a "Rules" e sostituisci con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bot_conversations/{conversationId} {
      allow read, write: if request.auth != null;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    match /bot_commands/{commandId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Clicca "Publish".

## Step 2: Modifica il Bot Server

Nel bot su Google Cloud (`whatsapp-bot/src/index.js`), aggiungi Firestore:

### Installa Firebase Admin SDK

```bash
npm install firebase-admin
```

### Configura Firebase nel bot

Aggiungi in cima a `src/index.js`:

```javascript
const admin = require('firebase-admin');

// Scarica il file JSON da Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
```

Scarica il file `serviceAccountKey.json` da Firebase Console > Project Settings > Service Accounts > Generate New Private Key.

### Salva le conversazioni in Firestore

Ogni volta che il bot riceve un messaggio, salva in Firestore:

```javascript
// Quando il bot riceve un messaggio
const chatId = msg.from; // ID della chat WhatsApp

// Salva il messaggio ricevuto
await db.collection('bot_conversations').doc(chatId).collection('messages').add({
  sender: 'user',
  text: msg.body,
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
});

// Aggiorna il documento della conversazione
await db.collection('bot_conversations').doc(chatId).set({
  contactName: contact.name || 'Contatto sconosciuto',
  contactPhone: msg.from,
  lastMessage: msg.body,
  lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
  status: isClient ? 'client' : 'new_lead',
  active: true,
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}, { merge: true });
```

### Salva le risposte del bot

Dopo che il bot manda una risposta:

```javascript
// Quando il bot manda una risposta
await db.collection('bot_conversations').doc(chatId).collection('messages').add({
  sender: 'bot',
  text: botResponse,
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
});

// Aggiorna il documento della conversazione
await db.collection('bot_conversations').doc(chatId).update({
  lastMessage: botResponse,
  lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
  messageCount: admin.firestore.FieldValue.increment(1),
});
```

### Ascolta i comandi del bot

Per permettere all'app di controllare il bot (pausa/attiva):

```javascript
// Ascolta i comandi da Firestore
db.collection('bot_commands').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      const command = change.doc.data();
      if (command.status === 'pending') {
        // Esegui il comando
        executeCommand(command.action);
        
        // Segna come eseguito
        change.doc.ref.update({ status: 'executed' });
      }
    }
  });
});

function executeCommand(action) {
  if (action === 'off') {
    botEnabled = false;
    console.log('Bot messo in pausa');
  } else if (action === 'on') {
    botEnabled = true;
    console.log('Bot attivato');
  } else if (action === 'reset') {
    // Reset della sessione se necessario
    console.log('Bot resettato');
  }
}
```

## Step 3: Configura le Variabili d'Ambiente

Nel bot server, aggiungi al `.env`:

```
FIREBASE_PROJECT_ID=your-project-id
```

## Step 4: Testa l'Integrazione

1. Avvia il bot server:
```bash
npm start
```

2. Nella app, fai login

3. Se il bot riceve un messaggio WhatsApp, dovrebbe apparire nella app in 3 secondi

## Troubleshooting

**"Firebase not configured"**
→ Verifica che `lib/firebase.ts` abbia le credenziali corrette

**"Permission denied" in Firestore**
→ Verifica le Firestore Rules sopra (deve permettere lettura/scrittura agli utenti autenticati)

**"Messages non si aggiornano"**
→ Verifica che il bot stia effettivamente scrivendo su Firestore (aggiungi `console.log`)

**"bot_commands non funzionano"**
→ Assicurati che il bot ascolti la collezione `bot_commands` nel server

## Struttura Finale Firestore

```
bot_conversations/
  ├── +393331234567/
  │   ├── active: true
  │   ├── contactName: "Mario Rossi"
  │   ├── contactPhone: "+393331234567"
  │   ├── lastMessage: "Grazie Valentina!"
  │   ├── lastMessageTime: 2026-01-26T15:30:00Z
  │   ├── status: "new_lead" | "client" | "paused"
  │   ├── messageCount: 5
  │   ├── updatedAt: 2026-01-26T15:30:00Z
  │   └── messages/
  │       ├── msg_1: { sender: "user", text: "Ciao!", timestamp: ... }
  │       ├── msg_2: { sender: "bot", text: "Ciao! Sono Valentina...", timestamp: ... }
  │       └── ...
  │
  └── +393339876543/
      └── ... (altre conversazioni)

bot_commands/
  ├── cmd_1: { action: "off", status: "pending", executedAt: ... }
  ├── cmd_2: { action: "on", status: "executed", executedAt: ... }
  └── ...
```

## Note Finali

- **Modalità test Firebase**: Con le regole sopra, chiunque si logghi può leggere/scrivere. Per produzione, restringi alle conversazioni dell'utente.
- **Costi**: Piano gratuito Firebase copre fino a 50k letture/giorno. Per un bot con pochi messaggi, è gratis perpetuamente.
- **Sincronizzazione**: L'app aggiorna ogni 3 secondi. Puoi cambiarla in `app/index.tsx`.
