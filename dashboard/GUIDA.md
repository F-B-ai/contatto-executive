# Valentina — Guida alla web app (dal tuo iPhone)

Questa è la **web app** per gestire il bot: la apri in Safari, la aggiungi alla schermata Home e sembra un'app vera. Niente App Store, niente computer, niente costi.

## Cosa fa

- 📋 Vedi tutte le conversazioni del bot, aggiornate in tempo reale
- 💬 Apri una chat e leggi tutti i messaggi
- ✍️ Invii un messaggio di prova per testare il bot
- ⏸️ Metti in pausa / riattivi il bot dal telefono

---

## Come si mette online (una volta sola)

La web app va "pubblicata" su internet gratis. Ci sono due modi; il più semplice è **GitHub Pages**, che si attiva da solo quando il codice è su GitHub (e lo è già).

### Opzione A — GitHub Pages (gratis, consigliata)

1. Vai su GitHub, nel repository `contatto-executive`
2. Tocca **Settings** → nel menu a sinistra **Pages**
3. Alla voce **Source** scegli il branch `claude/claude-md-docs-fnsb3h` (o `main` dopo il merge) e cartella `/ (root)`
4. Salva. Dopo 1-2 minuti la web app sarà su:
   `https://f-b-ai.github.io/contatto-executive/dashboard/`

Apri quel link da Safari sul tuo iPhone.

### Opzione B — Firebase Hosting (gratis)

Se preferisci, si può ospitare su Firebase Hosting. Richiede un passaggio in più da computer, quindi per ora resta su GitHub Pages.

---

## Aggiungere l'icona alla Home (iPhone/iPad)

1. Apri il link in **Safari**
2. Tocca il pulsante **Condividi** (il quadrato con la freccia in su)
3. Scorri e tocca **"Aggiungi alla schermata Home"**
4. Dai il nome **Valentina** e tocca **Aggiungi**

Ora hai un'icona rossa sulla Home: si apre a schermo intero come una vera app. 🎉

---

## Collegare Firebase (il "cervello" dei dati)

La web app ha bisogno di **Firebase** per salvare e leggere le conversazioni. È gratis.

### 1. Crea il progetto Firebase

1. Vai su https://console.firebase.google.com
2. Tocca **Aggiungi progetto** → dai un nome (es. `valentina-bot`)
3. Disattiva Google Analytics (non serve) → **Crea progetto**

### 2. Prendi le credenziali

1. Nella pagina del progetto, tocca l'ingranaggio ⚙️ in alto → **Impostazioni progetto**
2. Scorri fino a **Le tue app** → tocca l'icona **`</>`** (Web)
3. Dai un nome all'app (es. `dashboard`) → **Registra app**
4. Ti mostra un blocco `firebaseConfig` con dei valori. **Copiali.**

### 3. Incolla le credenziali nella web app

Apri il file `dashboard/index.html` e cerca questa parte (verso la fine):

```js
const firebaseConfig = {
  apiKey: "INSERISCI_API_KEY",
  authDomain: "INSERISCI_AUTH_DOMAIN",
  projectId: "INSERISCI_PROJECT_ID",
  storageBucket: "INSERISCI_STORAGE_BUCKET",
  messagingSenderId: "INSERISCI_MESSAGING_SENDER_ID",
  appId: "INSERISCI_APP_ID",
};
```

Sostituisci ogni `INSERISCI_…` con il valore corrispondente che hai copiato da Firebase.

> Se non hai un computer: puoi modificare questo file direttamente dal sito di GitHub (apri il file → icona matita ✏️ → modifica → Commit). Fammi sapere e ti guido passo-passo.

### 4. Attiva il database Firestore

1. In Firebase, menu a sinistra → **Firestore Database**
2. **Crea database** → modalità **test** → scegli zona **eur3 (Europa)** → **Attiva**
3. Vai sulla scheda **Regole (Rules)** e incolla questo, poi **Pubblica**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bot_conversations/{id} {
      allow read, write: if request.auth != null;
      match /messages/{msg} {
        allow read, write: if request.auth != null;
      }
    }
    match /bot_commands/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Crea il tuo utente per l'accesso

1. In Firebase, menu a sinistra → **Authentication** → **Inizia**
2. Scheda **Sign-in method** → attiva **Email/Password**
3. Scheda **Users** → **Aggiungi utente** → metti la tua email e una password
4. Quella email/password ti serviranno per accedere alla web app

---

## Collegare il bot server (l'ultimo passo)

Perché la web app mostri le conversazioni vere, il bot su Google Cloud deve **scrivere in Firestore**. Le istruzioni tecniche sono in `dashboard/COLLEGA_BOT.md`.

In sintesi: nel bot si aggiunge `firebase-admin` e, ad ogni messaggio ricevuto/inviato, si salva una riga in Firestore. Il bot legge anche `bot_commands` per obbedire ai comandi pausa/riattiva della web app.

---

## Riepilogo dei passi

1. ✅ Web app creata (fatto)
2. ⬜ Pubblicala con GitHub Pages
3. ⬜ Crea il progetto Firebase e incolla le credenziali in `index.html`
4. ⬜ Attiva Firestore + regole + un utente
5. ⬜ Aggiungi l'icona alla Home su iPhone
6. ⬜ Collega il bot server a Firestore (vedi `COLLEGA_BOT.md`)

Quando arrivi a un passo e ti blocchi, scrivimi **a che punto sei** e ti guido solo su quello.
