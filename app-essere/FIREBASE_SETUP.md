# Guida Setup Firebase per App ESSERE

## 1. Creare Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca **"Aggiungi progetto"**
3. Nome progetto: `app-essere` (o quello che preferisci)
4. Disabilita Google Analytics (non necessario per ora)
5. Clicca **"Crea progetto"**

## 2. Aggiungere App Web

1. Nella dashboard del progetto, clicca sull'icona **Web** (`</>`)
2. Nome app: `App ESSERE`
3. **NON** selezionare Firebase Hosting per ora
4. Clicca **"Registra app"**
5. **COPIA** la configurazione che appare:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy.....................",
  authDomain: "app-essere.firebaseapp.com",
  projectId: "app-essere",
  storageBucket: "app-essere.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 3. Attivare Authentication

1. Nel menu laterale, vai su **Build > Authentication**
2. Clicca **"Inizia"**
3. Vai su **Sign-in method**
4. Abilita **Email/Password**
   - Clicca su "Email/Password"
   - Attiva il primo toggle
   - Salva

## 4. Creare Database Firestore

1. Nel menu laterale, vai su **Build > Firestore Database**
2. Clicca **"Crea database"**
3. Seleziona **"Inizia in modalità test"** (per sviluppo)
4. Scegli la località più vicina (es. `europe-west1` per Europa)
5. Clicca **"Abilita"**

### Regole di Sicurezza (per sviluppo)

Vai su **Firestore > Regole** e usa queste regole per lo sviluppo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permetti lettura/scrittura solo a utenti autenticati
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANTE:** Prima del lancio in produzione, dovrai configurare regole più specifiche!

## 5. Attivare Storage (opzionale, per immagini)

1. Nel menu laterale, vai su **Build > Storage**
2. Clicca **"Inizia"**
3. Seleziona **"Inizia in modalità test"**
4. Scegli la località
5. Clicca **"Fine"**

## 6. Configurare l'App

### Opzione A: File .env (Raccomandato)

1. Crea il file `.env` nella root di `app-essere`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy.....................
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=app-essere.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=app-essere
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=app-essere.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

2. Aggiungi `.env` al `.gitignore` (già fatto)

### Opzione B: Direttamente nel codice

Modifica `src/services/firebase.ts` con le tue credenziali.

## 7. Creare Utente Titolare

Dopo aver configurato tutto:

1. Registra un account con l'app
2. Vai su **Firebase Console > Firestore**
3. Trova l'utente nella collezione `users`
4. Modifica il campo `ruolo` da `"allievo"` a `"titolare"`

Oppure usa lo script di setup (vedi sotto).

## 8. Verificare la Configurazione

Avvia l'app:

```bash
cd app-essere
npx expo start
```

Se vedi errori Firebase:
- Verifica che le credenziali siano corrette
- Controlla che Authentication e Firestore siano attivi
- Verifica le regole Firestore

## Troubleshooting

### Errore "Firebase App not initialized"
- Controlla che le credenziali in `.env` siano corrette
- Riavvia il server Expo dopo aver modificato `.env`

### Errore "Permission denied"
- Verifica che l'utente sia autenticato
- Controlla le regole Firestore

### Errore "Network error"
- Verifica la connessione internet
- Controlla che il progetto Firebase esista

---

## Costi Firebase (Piano Spark - Gratuito)

| Risorsa | Limite Gratuito |
|---------|-----------------|
| Authentication | 50k utenti/mese |
| Firestore letture | 50k/giorno |
| Firestore scritture | 20k/giorno |
| Firestore storage | 1 GB |
| Storage files | 5 GB |

Questi limiti sono più che sufficienti per iniziare!
