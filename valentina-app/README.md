# Valentina App — Bot Manager per iPhone e iPad

App React Native + Expo per gestire il bot Valentina direttamente da iPhone e iPad.

## Cosa Fa

✅ Dashboard con tutte le conversazioni del bot  
✅ Visualizza messaggi in tempo reale  
✅ Invia messaggi di test  
✅ Controlla il bot (pausa/attiva) da remoto  
✅ Funziona su iPhone e iPad  
✅ Completamente gratuita  

## Setup Veloce

### 1. Configura Firebase

1. Vai su https://console.firebase.google.com
2. Crea un nuovo progetto
3. Copia le credenziali da **Project Settings**

### 2. Aggiorna `lib/firebase.ts`

Sostituisci le credenziali placeholder con le tue.

### 3. Avvia l'App

```bash
cd valentina-app
npm install
npm start
```

Poi scansiona il QR con il telefono (Expo Go app).

## Struttura

```
valentina-app/
├── app/
│   ├── login.tsx              # Login
│   ├── index.tsx              # Dashboard
│   └── conversation.tsx       # Chat bot
├── lib/
│   ├── firebase.ts            # Firestore config
│   └── AuthContext.tsx        # Auth
```

## Come Funziona

1. Francesco fa login
2. Vede tutte le conversazioni del bot (live)
3. Può testare il bot e controllarlo (pausa/attiva)
4. I messaggi si aggiornano ogni 3 secondi

## Integrare con il Server Bot

Il bot su Google Cloud dovrà salvare in Firestore invece che in JSON.

Vedi la sezione "Setup Firestore" nel README principale.

## Publish su App Store / Google Play

```bash
eas build --platform ios   # iPhone
eas build --platform android  # Android
```

Richiede account EAS gratuito.
