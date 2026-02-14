# App ESSERE - Come Funziona

Guida completa per avviare e comprendere l'applicazione.

---

## Indice

1. [Cos'e App ESSERE](#cose-app-essere)
2. [Prerequisiti](#prerequisiti)
3. [Installazione](#installazione)
4. [Configurazione Firebase](#configurazione-firebase)
5. [Avvio dell'App](#avvio-dellapp)
6. [Struttura del Progetto](#struttura-del-progetto)
7. [Architettura](#architettura)
8. [Ruoli Utente](#ruoli-utente)
9. [Funzionalita Principali](#funzionalita-principali)
10. [Servizi](#servizi)
11. [Troubleshooting](#troubleshooting)

---

## Cos'e App ESSERE

App ESSERE e un'applicazione mobile per la gestione di un business di fitness coaching. Permette di:

- Gestire sessioni di allenamento
- Tracciare pagamenti e rate
- Gestire collaboratori e allievi
- Visualizzare statistiche economiche
- Coordinare calendari
- Condividere contenuti (video, podcast, documenti)
- Creare programmi di allenamento personalizzati

**Stack Tecnologico:**
- **Frontend:** React Native + Expo
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Linguaggio:** TypeScript
- **Navigazione:** React Navigation (Tab + Stack)

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

L'app richiede un progetto Firebase configurato. Vedi **FIREBASE_SETUP.md** per istruzioni dettagliate.

### Riepilogo rapido:

1. Crea un progetto su [Firebase Console](https://console.firebase.google.com)
2. Abilita **Authentication** (Email/Password)
3. Crea un database **Firestore**
4. Abilita **Storage** (opzionale)
5. Crea un file `.env` con le credenziali:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=app-essere.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=app-essere
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=app-essere.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Modalita Demo

Se Firebase non e configurato, l'app funziona in **modalita demo**:
- Login con qualsiasi email (es. `titolare@demo.com` per testare il ruolo titolare)
- Dati simulati localmente
- Nessuna persistenza

---

## Avvio dell'App

### Modalita Sviluppo

```bash
# Avvia il server di sviluppo Expo
npm start
```

Da qui puoi:
- **Premere `w`** - Apri nel browser web
- **Premere `a`** - Apri su Android
- **Premere `i`** - Apri su iOS
- **Scansiona QR code** - Apri su dispositivo fisico con Expo Go

### Comandi Specifici

```bash
npm run web       # Solo Web
npm run android   # Solo Android
npm run ios       # Solo iOS
```

---

## Struttura del Progetto

```
app-essere/
├── App.tsx                 # Entry point
├── app.json                # Configurazione Expo
├── package.json            # Dipendenze e script
├── tsconfig.json           # Configurazione TypeScript
├── FIREBASE_SETUP.md       # Guida setup Firebase
├── HOW_IT_WORKS.md         # Questa guida
│
├── assets/                 # Icone e immagini
│
└── src/
    ├── types/              # Definizioni TypeScript centralizzate
    │   └── index.ts        # Tutti i tipi dell'app
    │
    ├── constants/          # Costanti e configurazione
    │   ├── index.ts        # Export centrale
    │   └── theme.ts        # Colori, spacing, font
    │
    ├── context/            # React Context per stato globale
    │   └── AuthContext.tsx # Autenticazione e stato utente
    │
    ├── services/           # Layer servizi Firebase
    │   ├── firebase.ts        # Inizializzazione Firebase
    │   ├── userService.ts     # Gestione utenti
    │   ├── sessioniService.ts # Sessioni allenamento
    │   ├── economiaService.ts # Entrate, uscite, statistiche
    │   ├── pagamentiService.ts# Pagamenti e rate
    │   ├── programmiService.ts# Programmi di allenamento
    │   ├── contenutiService.ts# Contenuti condivisi
    │   └── chatService.ts     # Messaggistica
    │
    ├── navigation/         # Configurazione navigazione
    │   ├── index.ts            # Export centrale
    │   ├── RootNavigator.tsx   # Router principale
    │   ├── AuthNavigator.tsx   # Stack autenticazione
    │   ├── TitolareNavigator.tsx   # Tab Titolare
    │   ├── CollaboratoreNavigator.tsx # Tab Collaboratore
    │   └── AllievoNavigator.tsx     # Tab Allievo
    │
    ├── screens/            # Schermate organizzate per ruolo
    │   ├── auth/           # Login, Register, ForgotPassword
    │   ├── titolare/       # Dashboard, Economia, Collaboratori, Allievi, Calendario
    │   ├── collaboratore/  # Home, Allievi, Economia, Programmi, Calendario
    │   └── allievo/        # Home, Programma, Calendario, Contenuti, Profilo
    │
    └── components/         # Componenti UI riutilizzabili
        └── common/         # Avatar, Button, Card, Input, Loading
```

---

## Architettura

### Flusso Generale

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Entry Point)                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     AuthProvider                             │
│          (Gestisce stato autenticazione)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    RootNavigator                             │
│        (Decide quale navigatore mostrare)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
      ┌───────────────────┼───────────────────────┐
      ▼                   ▼                       ▼
┌─────────────┐   ┌───────────────┐       ┌─────────────┐
│AuthNavigator│   │TitolareNav    │  ...  │AllievoNav   │
│             │   │               │       │             │
│ • Login     │   │ • Dashboard   │       │ • Home      │
│ • Register  │   │ • Calendario  │       │ • Programma │
│ • Reset     │   │ • Economia    │       │ • Calendario│
└─────────────┘   └───────────────┘       └─────────────┘
```

### Flusso Autenticazione

1. **App.tsx** avvia l'app dentro `AuthProvider`
2. **AuthContext** verifica se Firebase e configurato
3. Se configurato, ascolta `onAuthStateChanged` di Firebase
4. Se non configurato, usa la **modalita demo**
5. **RootNavigator** legge `isAuthenticated` e `user.ruolo`
6. Mostra il navigatore appropriato:
   - Non autenticato → `AuthNavigator`
   - Titolare → `TitolareNavigator`
   - Collaboratore → `CollaboratoreNavigator`
   - Allievo → `AllievoNavigator`

### Flusso Dati

```
Screen (UI)
    │
    ▼ chiama
Service (Business Logic)
    │
    ▼ legge/scrive
Firebase (Firestore/Auth/Storage)
    │
    ▼ restituisce
Service
    │
    ▼ ritorna dati
Screen (aggiorna UI)
```

---

## Ruoli Utente

L'app supporta tre ruoli con permessi e schermate diverse:

### Titolare (Owner)

Il proprietario del business. Ha accesso completo.

| Tab | Funzione |
|-----|----------|
| Dashboard | Statistiche globali, sessioni recenti |
| Calendario | Tutte le sessioni del business |
| Collaboratori | Gestione coach, percentuali |
| Allievi | Tutti gli allievi |
| Economia | Entrate, uscite, profitto |

### Collaboratore (Coach)

I coach che lavorano nel business.

| Tab | Funzione |
|-----|----------|
| Home | Le proprie sessioni e guadagni |
| Calendario | Le proprie sessioni |
| Allievi | Solo i propri allievi |
| Economia | I propri guadagni |
| Programmi | Creazione programmi |

### Allievo (Student)

I clienti dell'attivita.

| Tab | Funzione |
|-----|----------|
| Home | Prossime sessioni |
| Programma | Programma assegnato |
| Calendario | Le proprie sessioni |
| Contenuti | Video, podcast, documenti |
| Profilo | Impostazioni personali |

---

## Funzionalita Principali

### Sistema Sessioni

Le sessioni sono gli appuntamenti tra collaboratore e allievo.

```typescript
Sessione {
  tipo: 'allenamento' | 'consulenza' | 'valutazione'
  stato: 'programmata' | 'completata' | 'annullata'
  durata: number  // minuti
  allievoId: string
  collaboratoreId: string
}
```

**Regola cancellazione:** Gli allievi possono annullare solo con piu di 10 ore di preavviso.

### Sistema Pagamenti

Gestione pagamenti con possibilita di rate.

```typescript
Pagamento {
  importoTotale: number
  modalita: 'unica' | 'rate'
  rate: Rata[]
  percentualeCollaboratore: number  // es. 60
  guadagnoCollaboratore: number
  quotaTitolare: number
}
```

Quando una rata viene pagata:
1. La rata e marcata come pagata
2. Viene creato un ricavo
3. Il ricavo e diviso tra Titolare e Collaboratore

### Sistema Economico

```
Economia Titolare
├── Entrate (da pagamenti allievi - quota titolare)
├── Uscite (affitto, attrezzature, marketing, utenze, personale)
└── Profitto = Entrate - Uscite
```

---

## Servizi

I servizi sono il layer tra le screen e Firebase.

### userService

Gestione utenti, collaboratori e allievi.

```typescript
// Utenti
userService.getUser(uid)
userService.createUser(uid, data)
userService.updateUser(uid, data)

// Collaboratori
collaboratoreService.getByUserId(userId)
collaboratoreService.create(data)
collaboratoreService.update(id, data)

// Allievi
allievoService.getByUserId(userId)
allievoService.create(data)
allievoService.getByCollaboratore(collaboratoreId)
```

### sessioniService

Gestione sessioni di allenamento.

```typescript
sessioniService.create(data)
sessioniService.getByAllievo(allievoId)
sessioniService.getByCollaboratore(collaboratoreId)
sessioniService.update(id, data)
sessioniService.delete(id)
```

### economiaService

Statistiche economiche e dashboard.

```typescript
economiaService.getRicavi(filtri)
economiaService.getSpese(filtri)
economiaService.getSommario(periodo)
```

### pagamentiService

Gestione pagamenti e rate.

```typescript
pagamentiService.create(data)
pagamentiService.getByAllievo(allievoId)
pagamentiService.pagaRata(pagamentoId, numeroRata)
```

### programmiService

Programmi di allenamento ed esercizi.

```typescript
programmiService.create(data)
programmiService.getByCollaboratore(collaboratoreId)
programmiService.assegna(programmaId, allievoId)
```

### contenutiService

Contenuti condivisi (video, podcast, documenti).

```typescript
contenutiService.create(data)
contenutiService.getVisibiliA(userId)
contenutiService.delete(id)
```

### chatService

Sistema di messaggistica.

```typescript
chatService.getConversazioni(userId)
chatService.getMessaggi(conversazioneId)
chatService.inviaMessaggio(conversazioneId, messaggio)
```

---

## Database Collections

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
| `contenuti` | Video, podcast, documenti |
| `conversazioni` | Chat tra utenti |
| `messaggi` | Messaggi delle chat |

---

## Troubleshooting

### L'app non si avvia

```bash
# Verifica Node.js
node --version   # Deve essere v18+

# Reinstalla dipendenze
rm -rf node_modules
npm install

# Pulisci cache Expo
npx expo start -c
```

### Errore "Firebase not configured"

L'app funziona in modalita demo. Per usare Firebase:
1. Crea progetto Firebase
2. Configura `.env` (vedi FIREBASE_SETUP.md)
3. Riavvia l'app

### Errore connessione Firestore

1. Verifica che Firestore sia abilitato in Firebase Console
2. Controlla le regole di sicurezza (usa modalita test per sviluppo)
3. Verifica la connessione internet

### Expo Go non trova l'app

1. Dispositivo e computer devono essere sulla stessa rete WiFi
2. Prova a usare "Tunnel" invece di "LAN" in Expo DevTools
3. Riavvia Expo con `npx expo start -c`

---

## Prossimi Sviluppi

Funzionalita pianificate:

- [ ] Notifiche Push
- [ ] Test Posturali con analisi AI
- [ ] Diario Allievo
- [ ] Statistiche avanzate
- [ ] Export dati PDF

---

## Contatti

Per supporto o informazioni:
- **WhatsApp:** [Francesco Busanca](https://wa.me/393891815566)
- **Instagram:** [@francesco.busanca](https://www.instagram.com/francesco.busanca)
