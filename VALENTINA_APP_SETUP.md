# Valentina App — Setup Completo

Guida passo-passo per far funzionare l'app React Native su iPhone e iPad.

## Cos'è

Valentina App è un'app mobile (iOS/iPadOS) per gestire il bot WhatsApp che risponde ai lead di Francesco.

**Funzionalità:**
- Visualizzare tutte le conversazioni del bot in tempo reale
- Inviare messaggi di test
- Controllare il bot (pausa/attiva/reset) da remoto
- Funziona perfettamente su iPhone e iPad

## Architecture

```
Francesco's iPhone/iPad
         ↓
   Valentina App
   (React Native)
         ↓
   Firebase Firestore
   (live database)
         ↓
   Bot Server (Google Cloud)
   (whatsapp-web.js)
```

## Quick Start

### 1. Setup Firebase (5 min)

1. Vai su https://console.firebase.google.com
2. Crea un progetto nuovo
3. Copia le credenziali da **Project Settings**
4. Incollale in `valentina-app/lib/firebase.ts`

### 2. Configura Firestore (3 min)

1. In Firebase Console, vai a **Firestore Database**
2. Crea un database in modalità "test"
3. Vai alla scheda **Rules** e incolla:

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

4. Clicca **Publish**

### 3. Abilita Autenticazione (2 min)

1. In Firebase Console, vai a **Authentication**
2. Clicca **Get started** → **Email/Password**
3. Vai a **Users** e crea un utente:
   - Email: `test@example.com`
   - Password: `password123`

### 4. Avvia l'App (3 min)

```bash
cd valentina-app
npm install
npm start
```

Nel terminale, scansiona il QR code con il telefono (usando Expo Go app).

### 5. Testa

1. Fai login con `test@example.com` / `password123`
2. Dovresti vedere una dashboard (probabilmente vuota perché il bot non ha conversazioni yet)

## Integrare il Bot Server

Il bot su Google Cloud deve salvare le conversazioni in Firestore.

**Vedi: `valentina-app/SETUP_FIRESTORE.md`** per le istruzioni complete.

In breve:

1. Aggiungi Firebase Admin SDK al bot:
```bash
npm install firebase-admin
```

2. Nel bot, salva i messaggi in Firestore invece che in JSON

3. Riavvia il bot

4. Ora quando il bot riceve messaggi WhatsApp, appariranno nella app in tempo reale

## Pubblicare su App Store / Google Play

**Vedi: `valentina-app/DEPLOY.md`** per le istruzioni complete.

In breve:

```bash
# Crea account EAS (gratuito)
npm install -g eas-cli
eas login
eas init

# Build per iOS
eas build --platform ios --auto-submit

# Build per Android
eas build --platform android
```

Costi:
- Apple Developer Account: $99/anno
- Google Play Account: $25 (one-time)
- Build via EAS: Gratuito

## Struttura Cartelle

```
valentina-app/
├── app/
│   ├── _layout.tsx              # Navigazione principale
│   ├── login.tsx                # Schermata login
│   ├── index.tsx                # Dashboard conversazioni
│   └── conversation.tsx         # Dettaglio conversazione
├── lib/
│   ├── firebase.ts              # Config Firebase
│   └── AuthContext.tsx          # Gestione auth
├── assets/                       # Icone, splash screen
├── app.json                      # Config app (nome, versione, etc)
├── package.json                 # Dipendenze
├── README.md                     # Info rapida
├── SETUP_FIRESTORE.md           # Come integrare il bot
└── DEPLOY.md                     # Come pubblicare
```

## Cosa Puoi Fare Adesso

- ✅ Eseguire l'app localmente (`npm start`)
- ✅ Testare su Expo Go
- ✅ Fare build per testing (TestFlight per iOS, Internal Testing per Android)
- ✅ Pubblicare ufficialmente su App Store e Play Store

## Cosa Rimane da Fare

1. **Integrare il bot server**: Il bot su Google Cloud deve salvare in Firestore
2. **Testare con veri messaggi**: Una volta che il bot salva in Firestore, l'app vedrà i messaggi live
3. **Personalizzare l'app**:
   - Cambiare il colore (attualmente rosso #C1121F)
   - Aggiungere il logo di Francesco
   - Modificare i testi
4. **Aggiungere più funzionalità** (dopo che funziona il core):
   - Notifiche push quando arrivano messaggi
   - Statistiche conversazioni
   - Export chat in PDF

## FAQ

**D: Quanto costa far girare l'app?**
A: Gratis (Firebase piano Spark, EAS gratuito). Paghi solo App Store ($99/anno) e Play Store ($25 one-time).

**D: Funziona senza il bot server?**
A: Sì, ma è solo una shell vuota. Serve il bot server che scrive in Firestore.

**D: Posso testare prima di pubblicare?**
A: Sì! Usa Expo Go (scansiona QR) o TestFlight/Google Play beta.

**D: Che versione di iOS serve?**
A: iOS 13+. iPad segue la stessa regola.

**D: Posso modificare l'app dopo la pubblicazione?**
A: Sì, fai un update e republish. Non è necessario rifare il setup Firebase.

## Contatti Utili

- Firebase Console: https://console.firebase.google.com
- EAS Dashboard: https://expo.dev/projects
- Expo Docs: https://docs.expo.dev
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console

## Prossimi Step

1. Configura le credenziali Firebase in `lib/firebase.ts`
2. Crea utenti di test in Firebase Authentication
3. Avvia l'app (`npm start`)
4. Scansiona il QR con il telefono
5. Fai login e testa
6. Leggi `SETUP_FIRESTORE.md` per integrare il bot

---

**L'app è pronta per lo sviluppo! 🚀**

Domande? Controlla i commenti nei file TypeScript.
