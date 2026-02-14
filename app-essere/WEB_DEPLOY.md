# Pubblicare App ESSERE come Web App

Guida rapida per pubblicare l'app su Firebase Hosting e condividerla con allievi e collaboratori.

---

## Prerequisiti

- Firebase configurato (vedi FIREBASE_SETUP.md)
- Node.js installato

---

## Setup Iniziale (Solo la Prima Volta)

### Step 1: Installa Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login Firebase

```bash
firebase login
```

Si apre il browser, accedi con il tuo account Google (stesso di Firebase Console).

### Step 3: Collega il Progetto

Modifica il file `.firebaserc` e sostituisci `YOUR_FIREBASE_PROJECT_ID` con il tuo Project ID:

```json
{
  "projects": {
    "default": "app-essere-xxxxx"
  }
}
```

**Dove trovo il Project ID?**
1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Clicca sul tuo progetto
3. Icona ingranaggio > Impostazioni progetto
4. Copia il "ID progetto"

### Step 4: Abilita Hosting su Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il tuo progetto
3. Menu laterale: **Build > Hosting**
4. Clicca **"Inizia"**
5. Segui i passaggi (puoi saltare quelli gia fatti)

---

## Pubblicare l'App

### Metodo Semplice (Un Comando)

```bash
cd app-essere
npm run deploy
```

Questo:
1. Compila l'app per web
2. Carica su Firebase Hosting
3. Ti da l'URL pubblico

### Output Esempio

```
✔ Deploy complete!

Hosting URL: https://app-essere-xxxxx.web.app
```

---

## Condividere con Allievi e Collaboratori

Dopo il deploy, hai due URL:

| URL | Descrizione |
|-----|-------------|
| `https://PROGETTO.web.app` | URL principale |
| `https://PROGETTO.firebaseapp.com` | URL alternativo |

### Come Condividere

1. **WhatsApp/Telegram:** Invia il link direttamente
2. **Email:** Manda email con il link
3. **QR Code:** Genera QR code da [qr-code-generator.com](https://www.qr-code-generator.com)

### Aggiungere a Home Screen (Come App)

Gli utenti possono aggiungere l'app alla schermata home:

**iPhone:**
1. Apri link in Safari
2. Tocca icona "Condividi" (quadrato con freccia)
3. Scorri e tocca "Aggiungi a Home"

**Android:**
1. Apri link in Chrome
2. Tocca menu (3 puntini)
3. Tocca "Aggiungi a schermata Home"

---

## Aggiornare l'App

Quando fai modifiche all'app:

```bash
npm run deploy
```

Gli utenti vedranno la nuova versione ricaricando la pagina.

---

## Anteprima Prima di Pubblicare

Per testare senza sovrascrivere la versione live:

```bash
npm run deploy:preview
```

Ricevi un URL temporaneo per testare.

---

## Comandi Rapidi

| Comando | Descrizione |
|---------|-------------|
| `npm run web` | Test locale nel browser |
| `npm run build:web` | Solo build (senza deploy) |
| `npm run deploy` | Build + Deploy |
| `npm run deploy:preview` | Deploy su URL temporaneo |

---

## Troubleshooting

### Errore "Firebase project not found"

```bash
# Verifica progetti disponibili
firebase projects:list

# Seleziona il progetto corretto
firebase use NOME_PROGETTO
```

### Errore "Permission denied"

```bash
# Ri-effettua login
firebase login --reauth
```

### La pagina mostra errore 404

Verifica che `firebase.json` contenga i rewrites corretti (gia configurato).

### Le modifiche non appaiono

1. Forza refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
2. Svuota cache browser
3. Prova in incognito

---

## Costi

Firebase Hosting e **gratuito** fino a:
- 10 GB storage
- 360 MB/giorno trasferimento
- 1 dominio personalizzato

Piu che sufficiente per un'app di studio!

---

## Dominio Personalizzato (Opzionale)

Puoi usare un dominio tipo `app.tuosito.it` invece di `xxx.web.app`:

1. Firebase Console > Hosting
2. "Aggiungi dominio personalizzato"
3. Segui le istruzioni per configurare DNS

---

## Riepilogo

```bash
# Prima volta
npm install -g firebase-tools
firebase login
# modifica .firebaserc con il tuo project ID

# Ogni volta che vuoi pubblicare
npm run deploy

# Condividi il link!
# https://TUO-PROGETTO.web.app
```

---

*Guida creata: Febbraio 2026*
