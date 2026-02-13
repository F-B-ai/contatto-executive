# App ESSERE - Come Funziona

Guida completa per avviare e comprendere l'applicazione.

---

## Indice

1. [Cos'è App ESSERE](#cosè-app-essere)
2. [Prerequisiti](#prerequisiti)
3. [Installazione](#installazione)
4. [Configurazione Firebase](#configurazione-firebase)
5. [Avvio dell'App](#avvio-dellapp)
6. [Struttura del Progetto](#struttura-del-progetto)
7. [Come Funziona](#come-funziona)
8. [Ruoli Utente](#ruoli-utente)
9. [Funzionalità Principali](#funzionalità-principali)

---

## Cos'è App ESSERE

App ESSERE è un'applicazione mobile per la gestione di un business di fitness coaching. Permette di:

- Gestire sessioni di allenamento
- Tracciare pagamenti e rate
- Gestire collaboratori e allievi
- Visualizzare statistiche economiche
- Coordinare calendari

**Stack Tecnologico:**
- **Frontend:** React Native + Expo
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Linguaggio:** TypeScript

---

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

| Software | Versione Minima | Download |
|----------|-----------------|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Incluso con Node.js |
| Expo CLI | latest | `npm install -g expo-cli` |

**Per testare su dispositivo:**
- **iOS:** Scarica "Expo Go" dall'App Store
- **Android:** Scarica "Expo Go" dal Play Store
- **Web:** Browser moderno (Chrome, Firefox, Safari)

---

## Installazione

### 1. Clona il repository

```bash
git clone <repository-url>
cd contatto-executive/app-essere
```

### 2. Installa le dipendenze

```bash
npm install
```

Questo installerà tutte le dipendenze definite in `package.json`:
- React Native & Expo
- Firebase SDK
- React Navigation
- DateTimePicker, ImagePicker, etc.

---

## Configurazione Firebase

L'app richiede un progetto Firebase configurato. Segui questi passi:

### 1. Crea un progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Clicca "Aggiungi progetto"
3. Nomina il progetto (es. `app-essere`)
4. Completa la creazione

### 2. Abilita i servizi necessari

Nel tuo progetto Firebase, abilita:

#### Authentication
1. Vai su **Authentication** > **Sign-in method**
2. Abilita **Email/Password**

#### Firestore Database
1. Vai su **Firestore Database**
2. Clicca "Crea database"
3. Scegli "Avvia in modalità test" (per sviluppo)
4. Seleziona la region più vicina (es. `europe-west1`)

#### Storage
1. Vai su **Storage**
2. Clicca "Inizia"
3. Conferma le regole di sicurezza

### 3. Ottieni le credenziali

1. Vai su **Impostazioni progetto** (icona ingranaggio)
2. Scorri fino a "Le tue app"
3. Clicca sull'icona **Web** (`</>`)
4. Registra l'app con un nickname
5. Copia le credenziali mostrate

### 4. Configura l'app

Apri il file `src/services/firebase.ts` e sostituisci i placeholder:

```typescript
const firebaseConfig = {
  apiKey: "LA_TUA_API_KEY",
  authDomain: "IL_TUO_PROJECT_ID.firebaseapp.com",
  projectId: "IL_TUO_PROJECT_ID",
  storageBucket: "IL_TUO_PROJECT_ID.appspot.com",
  messagingSenderId: "IL_TUO_SENDER_ID",
  appId: "IL_TUO_APP_ID",
};
```

---

## Avvio dell'App

### Modalità Sviluppo

```bash
# Avvia il server di sviluppo Expo
npm start
```

Questo aprirà Expo DevTools nel browser. Da qui puoi:

- **Premere `w`** → Apri nel browser web
- **Premere `a`** → Apri su Android (emulatore o Expo Go)
- **Premere `i`** → Apri su iOS (simulatore o Expo Go)
- **Scansiona QR code** → Apri su dispositivo fisico con Expo Go

### Comandi Specifici per Piattaforma

```bash
# Solo Web
npm run web

# Solo Android
npm run android

# Solo iOS
npm run ios
```

### Modalità Produzione

Per creare build di produzione, usa EAS Build:

```bash
# Installa EAS CLI
npm install -g eas-cli

# Login Expo
eas login

# Build Android APK
eas build --platform android --profile preview

# Build iOS (richiede Apple Developer Account)
eas build --platform ios --profile preview
```

---

## Struttura del Progetto

```
app-essere/
├── App.tsx                 # Entry point dell'applicazione
├── app.json                # Configurazione Expo
├── package.json            # Dipendenze e script
├── tsconfig.json           # Configurazione TypeScript
│
├── assets/                 # Icone e immagini
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
└── src/
    ├── components/         # Componenti UI riutilizzabili
    │   ├── common/         # Button, Card, Input, Loading
    │   └── calendar/       # CalendarView
    │
    ├── screens/            # Schermate organizzate per ruolo
    │   ├── auth/           # Login, Register, ForgotPassword
    │   ├── titolare/       # Dashboard, Economia, Spese, Collaboratori
    │   ├── collaboratore/  # Home collaboratore
    │   ├── allievo/        # Home allievo
    │   └── shared/         # Schermate condivise tra ruoli
    │
    ├── services/           # Logica business e Firebase
    │   ├── firebase.ts     # Configurazione Firebase
    │   ├── userService.ts  # Gestione utenti
    │   ├── sessionService.ts   # Gestione sessioni
    │   ├── paymentService.ts   # Gestione pagamenti
    │   ├── programService.ts   # Gestione programmi
    │   └── calendarService.ts  # Gestione calendario
    │
    ├── context/            # React Context per stato globale
    │   └── AuthContext.tsx # Stato autenticazione
    │
    ├── navigation/         # Configurazione navigazione
    │   ├── AppNavigator.tsx    # Router principale
    │   ├── AuthNavigator.tsx   # Router autenticazione
    │   └── types.ts            # Tipi navigazione
    │
    ├── constants/          # Costanti e configurazione
    │   └── theme.ts        # Colori, spacing, regole business
    │
    ├── types/              # Definizioni TypeScript
    │   └── index.ts        # Tutti i tipi dell'app
    │
    └── utils/              # Funzioni helper
```

---

## Come Funziona

### Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Entry Point)                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     AuthContext                              │
│          (Gestisce stato autenticazione)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│    AuthNavigator      │   │     AppNavigator      │
│  (Utente non loggato) │   │   (Utente loggato)    │
│                       │   │                       │
│  • Login              │   │  • Titolare screens   │
│  • Register           │   │  • Collaboratore      │
│  • ForgotPassword     │   │  • Allievo screens    │
└───────────────────────┘   └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │      Services         │
                            │  (Business Logic)     │
                            │                       │
                            │  • userService        │
                            │  • sessionService     │
                            │  • paymentService     │
                            └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │       Firebase        │
                            │                       │
                            │  • Authentication     │
                            │  • Firestore DB       │
                            │  • Storage            │
                            └───────────────────────┘
```

### Flusso di Autenticazione

1. **App.tsx** carica e wrappa tutto in `AuthProvider`
2. **AuthContext** verifica se esiste un utente salvato
3. Se **non autenticato** → mostra `AuthNavigator` (Login/Register)
4. Se **autenticato** → mostra `AppNavigator`
5. **AppNavigator** legge il ruolo utente e mostra le schermate appropriate

### Flusso Dati

```
Utente interagisce con Screen
            │
            ▼
Screen chiama Service (es. sessionService.createSession())
            │
            ▼
Service esegue operazione su Firebase/Firestore
            │
            ▼
Firestore salva/restituisce dati
            │
            ▼
Service restituisce risultato a Screen
            │
            ▼
Screen aggiorna UI con nuovi dati
```

---

## Ruoli Utente

L'app supporta tre ruoli con permessi diversi:

### Titolare (Owner)

Il proprietario del business. Ha accesso completo a:

| Funzione | Descrizione |
|----------|-------------|
| Dashboard | Statistiche globali, sessioni, pagamenti |
| Collaboratori | Gestione coach, percentuali guadagno |
| Allievi | Tutti gli allievi del business |
| Economia | Entrate, uscite, profitto |
| Spese | Gestione spese (affitto, attrezzature, etc.) |
| Sessioni | Tutte le sessioni del business |
| Pagamenti | Tutti i pagamenti e rate |

### Collaboratore (Coach)

I coach che lavorano nel business. Accesso a:

| Funzione | Descrizione |
|----------|-------------|
| Home | Le proprie sessioni e guadagni |
| Allievi | Solo i propri allievi |
| Calendario | Le proprie sessioni |
| Sessioni | Creazione e gestione proprie sessioni |

### Allievo (Student)

I clienti. Accesso a:

| Funzione | Descrizione |
|----------|-------------|
| Home | Prossime sessioni, programmi |
| Calendario | Le proprie sessioni |
| Pagamenti | Stato propri pagamenti |
| Programmi | Programmi assegnati |

---

## Funzionalità Principali

### Sistema Sessioni

```
Sessione
├── Tipo: Allenamento | Consulenza Nutrizionale | Valutazione
├── Stato: Programmata | Completata | Annullata
├── Durata: in minuti
├── Collaboratore: chi tiene la sessione
├── Allievo: chi partecipa
└── Note: appunti del coach
```

**Regola cancellazione:** Gli allievi possono annullare solo se mancano più di 10 ore alla sessione.

### Sistema Pagamenti

```
Pagamento
├── Importo totale
├── Tipo: Sessione singola | Abbonamento | Pacchetto
├── Rate: divisione in rate mensili
│   ├── Rata 1: importo, scadenza, stato
│   ├── Rata 2: importo, scadenza, stato
│   └── ...
└── Stato: Pagato | In attesa | Scaduto
```

Quando una rata viene pagata:
1. La rata viene marcata come pagata
2. Viene creato automaticamente un ricavo
3. Il ricavo viene diviso tra Titolare e Collaboratore secondo le percentuali

### Sistema Economico

```
Economia Titolare
├── Entrate
│   ├── Da pagamenti allievi
│   └── Quota titolare (100% - % collaboratore)
├── Uscite
│   ├── Affitto
│   ├── Attrezzature
│   ├── Marketing
│   ├── Utenze
│   └── Personale
└── Profitto = Entrate - Uscite
```

### Database Collections

| Collection | Descrizione |
|------------|-------------|
| `users` | Dati base utenti (email, nome, ruolo) |
| `collaboratori` | Profili coach con percentuale |
| `allievi` | Profili allievi con collegamento a coach |
| `sessioni` | Tutte le sessioni |
| `pagamenti` | Pagamenti con rate |
| `spese` | Spese del business |
| `ricavi` | Ricavi generati |
| `programmi` | Programmi di allenamento |
| `esercizi` | Libreria esercizi |
| `calendario` | Eventi calendario |

---

## Troubleshooting

### L'app non si avvia

1. Verifica che Node.js sia installato: `node --version`
2. Reinstalla dipendenze: `rm -rf node_modules && npm install`
3. Pulisci cache Expo: `expo start -c`

### Errore "Firebase not configured"

Verifica di aver configurato correttamente `src/services/firebase.ts` con le tue credenziali.

### Errore connessione Firestore

1. Verifica che Firestore sia abilitato nella console Firebase
2. Controlla le regole di sicurezza (in sviluppo usa modalità test)
3. Verifica la connessione internet

### Expo Go non trova l'app

1. Assicurati che dispositivo e computer siano sulla stessa rete WiFi
2. Prova a usare "Tunnel" invece di "LAN" in Expo DevTools

---

## Prossimi Passi

Funzionalità pianificate ma non ancora implementate:

- [ ] Sistema Chat
- [ ] Notifiche Push
- [ ] Test Posturali con AI
- [ ] Diario Allievo
- [ ] Contenuti Speciali (podcast, video)

---

## Contatti

Per supporto o informazioni:
- **WhatsApp:** [Francesco Busanca](https://wa.me/393891815566)
- **Instagram:** [@francesco.busanca](https://www.instagram.com/francesco.busanca)
