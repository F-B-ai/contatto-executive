# Guida Completa: Attivazione e Distribuzione App ESSERE

Questa guida ti accompagna passo passo dalla configurazione iniziale alla pubblicazione sugli store.

---

## Indice

1. [Fase 1: Preparazione Ambiente](#fase-1-preparazione-ambiente)
2. [Fase 2: Configurazione Firebase](#fase-2-configurazione-firebase)
3. [Fase 3: Account Sviluppatore](#fase-3-account-sviluppatore)
4. [Fase 4: Configurazione EAS](#fase-4-configurazione-eas)
5. [Fase 5: Build di Test](#fase-5-build-di-test)
6. [Fase 6: Preparazione Store](#fase-6-preparazione-store)
7. [Fase 7: Pubblicazione Android](#fase-7-pubblicazione-android)
8. [Fase 8: Pubblicazione iOS](#fase-8-pubblicazione-ios)
9. [Fase 9: Aggiornamenti Post-Lancio](#fase-9-aggiornamenti-post-lancio)
10. [Checklist Finale](#checklist-finale)

---

## Fase 1: Preparazione Ambiente

### 1.1 Installa Software Necessario

```bash
# Verifica Node.js (richiesto v18+)
node --version

# Se non hai Node.js, scaricalo da https://nodejs.org
# Consigliato: usa nvm per gestire versioni Node
```

### 1.2 Installa Strumenti CLI

```bash
# Installa Expo CLI globalmente
npm install -g expo-cli

# Installa EAS CLI (per build e submit)
npm install -g eas-cli

# Verifica installazione
expo --version
eas --version
```

### 1.3 Installa Dipendenze Progetto

```bash
# Vai nella cartella del progetto
cd app-essere

# Installa tutte le dipendenze
npm install
```

### 1.4 Test Avvio Locale

```bash
# Avvia l'app in modalita sviluppo
npm start

# Premi 'w' per aprire nel browser
# Oppure scansiona il QR code con Expo Go sul telefono
```

**Verifica che l'app si avvii correttamente prima di procedere.**

---

## Fase 2: Configurazione Firebase

### 2.1 Crea Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Clicca **"Aggiungi progetto"**
3. Nome progetto: `app-essere` (o nome a tua scelta)
4. Disabilita Google Analytics (opzionale, non necessario)
5. Clicca **"Crea progetto"**

### 2.2 Abilita Authentication

1. Nel menu laterale: **Build > Authentication**
2. Clicca **"Inizia"**
3. Vai su **"Sign-in method"**
4. Abilita **"Email/Password"**
5. Salva

### 2.3 Crea Database Firestore

1. Nel menu laterale: **Build > Firestore Database**
2. Clicca **"Crea database"**
3. Scegli **"Avvia in modalita test"** (per sviluppo)
4. Seleziona location: **eur3 (europe-west)** consigliato per Italia
5. Clicca **"Abilita"**

### 2.4 Abilita Storage

1. Nel menu laterale: **Build > Storage**
2. Clicca **"Inizia"**
3. Scegli **"Avvia in modalita test"**
4. Stessa location di Firestore
5. Clicca **"Fine"**

### 2.5 Ottieni Credenziali

1. Clicca icona ingranaggio > **"Impostazioni progetto"**
2. Scorri fino a **"Le tue app"**
3. Clicca icona **"</>"** (Web)
4. Nome app: `App ESSERE Web`
5. **NON** abilitare Firebase Hosting (non necessario)
6. Clicca **"Registra app"**
7. Copia le credenziali mostrate

### 2.6 Configura File .env

Crea il file `.env` nella cartella `app-essere`:

```bash
# Crea il file
touch .env
```

Inserisci le credenziali (sostituisci con i tuoi valori):

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=app-essere-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=app-essere-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=app-essere-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

### 2.7 Verifica Connessione

```bash
# Riavvia l'app
npm start

# Prova a registrare un utente di test
# Se funziona, Firebase e configurato correttamente!
```

---

## Fase 3: Account Sviluppatore

### 3.1 Account Google Play (Android)

1. Vai su [Google Play Console](https://play.google.com/console)
2. Clicca **"Crea account sviluppatore"**
3. Paga la quota di registrazione: **€25** (una tantum)
4. Compila i dati richiesti:
   - Nome sviluppatore
   - Email di contatto
   - Numero di telefono
5. Accetta i termini e condizioni
6. Attendi verifica (di solito 24-48 ore)

### 3.2 Account Apple Developer (iOS)

1. Vai su [Apple Developer](https://developer.apple.com/programs/)
2. Clicca **"Enroll"**
3. Accedi con il tuo Apple ID (o creane uno)
4. Scegli tipo di iscrizione:
   - **Individual** per singolo sviluppatore
   - **Organization** per azienda
5. Paga la quota annuale: **€99/anno**
6. Completa la verifica identita
7. Attendi approvazione (1-3 giorni lavorativi)

### 3.3 Account Expo

1. Vai su [expo.dev](https://expo.dev)
2. Clicca **"Sign Up"**
3. Crea account (gratuito)
4. Verifica email

```bash
# Login da terminale
eas login

# Inserisci credenziali Expo
```

---

## Fase 4: Configurazione EAS

### 4.1 Inizializza Progetto EAS

```bash
cd app-essere

# Configura il progetto con EAS
eas build:configure
```

Questo comando:
- Crea/aggiorna `eas.json`
- Registra il progetto su Expo
- Genera un Project ID

### 4.2 Aggiorna app.json

Dopo `eas build:configure`, aggiorna `app.json` con il Project ID generato:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "IL-TUO-PROJECT-ID-GENERATO"
      }
    },
    "owner": "IL-TUO-USERNAME-EXPO"
  }
}
```

### 4.3 Configura Credenziali iOS (opzionale ora)

EAS puo gestire automaticamente i certificati iOS. Se vuoi farlo manualmente:

```bash
# Configura credenziali iOS
eas credentials --platform ios
```

---

## Fase 5: Build di Test

### 5.1 Build Preview Android (APK)

```bash
# Crea APK per test
npm run build:preview:android

# Oppure
eas build --platform android --profile preview
```

**Cosa succede:**
1. EAS compila l'app nel cloud
2. Ricevi link per scaricare l'APK
3. Installa l'APK su dispositivo Android per test

### 5.2 Build Preview iOS

```bash
# Crea build iOS per test
npm run build:preview:ios

# Oppure
eas build --platform ios --profile preview
```

**Nota:** Per iOS, EAS gestira i certificati automaticamente.

### 5.3 Test su Dispositivi

**Android:**
1. Scarica l'APK dal link fornito
2. Trasferisci sul telefono
3. Abilita "Origini sconosciute" nelle impostazioni
4. Installa e testa

**iOS:**
1. Scarica tramite link fornito da EAS
2. Usa TestFlight per distribuzione interna
3. Oppure usa Ad Hoc distribution

---

## Fase 6: Preparazione Store

### 6.1 Icone App

Assicurati di avere le icone corrette in `assets/`:

| File | Dimensioni | Uso |
|------|------------|-----|
| `icon.png` | 1024x1024 px | Icona principale |
| `adaptive-icon.png` | 1024x1024 px | Android adaptive icon |
| `splash-icon.png` | 1284x2778 px | Splash screen |
| `favicon.png` | 48x48 px | Web favicon |

**Tool consigliato:** [App Icon Generator](https://appicon.co)

### 6.2 Screenshot per Store

Prepara screenshot dell'app:

**Google Play:**
- Minimo 2 screenshot
- Dimensioni: 1080x1920 px (portrait)
- Formato: JPEG o PNG

**App Store:**
- iPhone 6.5": 1284x2778 px
- iPhone 5.5": 1242x2208 px
- iPad Pro 12.9": 2048x2732 px

### 6.3 Descrizione App

Prepara testi per lo store:

```
TITOLO: App ESSERE
SOTTOTITOLO: Gestione Fitness Coaching

DESCRIZIONE BREVE (80 caratteri):
Gestisci sessioni, pagamenti e allievi del tuo business fitness.

DESCRIZIONE COMPLETA:
App ESSERE e l'app completa per gestire il tuo business di fitness coaching.

Funzionalita principali:
- Gestione sessioni di allenamento
- Calendario condiviso
- Tracciamento pagamenti e rate
- Gestione collaboratori e percentuali
- Programmi allenamento personalizzati
- Chat integrata
- Contenuti esclusivi (video, podcast)
- Statistiche economiche

Ideale per:
- Personal trainer
- Centri fitness
- Coach sportivi
- Nutrizionisti

Inizia subito a gestire il tuo business in modo professionale!
```

### 6.4 Privacy Policy

**OBBLIGATORIO** per entrambi gli store. Crea una pagina web con la privacy policy.

Opzioni gratuite:
- [TermsFeed](https://termsfeed.com) - Genera privacy policy gratis
- GitHub Pages - Hosting gratuito
- Firebase Hosting - Gia incluso nel tuo progetto

Esempio URL: `https://tuosito.com/privacy-policy`

---

## Fase 7: Pubblicazione Android

### 7.1 Crea App su Google Play Console

1. Vai su [Google Play Console](https://play.google.com/console)
2. Clicca **"Crea app"**
3. Compila:
   - Nome app: `App ESSERE`
   - Lingua predefinita: Italiano
   - Tipo: App
   - Gratuita o a pagamento
4. Accetta le dichiarazioni
5. Clicca **"Crea app"**

### 7.2 Compila Scheda Store

1. **Dashboard app > Scheda dello store principale**
2. Compila tutti i campi:
   - Descrizione breve
   - Descrizione completa
   - Icona app (512x512)
   - Immagine in primo piano (1024x500)
   - Screenshot telefono
   - Screenshot tablet (opzionale)
3. Salva

### 7.3 Compila Questionario Contenuti

1. **Policy > Contenuti dell'app**
2. Rispondi a tutte le domande:
   - Privacy policy URL
   - Annunci (No)
   - Accesso all'app
   - Target di eta
   - etc.

### 7.4 Build Produzione Android

```bash
# Crea build per Google Play (AAB)
npm run build:prod:android

# Oppure
eas build --platform android --profile production
```

### 7.5 Upload e Pubblica

**Metodo 1: Upload Manuale**
1. Scarica il file `.aab` dal link EAS
2. Play Console > **Release > Produzione**
3. Clicca **"Crea nuova release"**
4. Carica il file `.aab`
5. Compila note di rilascio
6. **"Rivedi release"** > **"Avvia rollout"**

**Metodo 2: Submit Automatico**
```bash
# Prima configura le credenziali Google Play
eas credentials --platform android

# Poi submit
npm run submit:android
```

### 7.6 Revisione Google

- Tempo: 1-7 giorni (prima release piu lunga)
- Riceverai email con esito
- Se rifiutata, correggi e ri-sottometti

---

## Fase 8: Pubblicazione iOS

### 8.1 Configura App Store Connect

1. Vai su [App Store Connect](https://appstoreconnect.apple.com)
2. Clicca **"My Apps"** > **"+"** > **"New App"**
3. Compila:
   - Platform: iOS
   - Name: App ESSERE
   - Primary Language: Italian
   - Bundle ID: `com.essere.app`
   - SKU: `appessere001`
4. Clicca **"Create"**

### 8.2 Compila Informazioni App

1. **App Information:**
   - Subtitle
   - Privacy Policy URL
   - Category: Health & Fitness

2. **Pricing and Availability:**
   - Price: Free (o a pagamento)
   - Availability: All countries

3. **App Privacy:**
   - Compila il questionario sulla privacy
   - Indica quali dati raccoglie l'app

### 8.3 Prepara per Submission

1. **Version Information:**
   - Screenshots per ogni device
   - Description
   - Keywords
   - Support URL
   - Marketing URL (opzionale)

2. **Build:**
   - Carica build tramite EAS

### 8.4 Build Produzione iOS

```bash
# Crea build per App Store
npm run build:prod:ios

# Oppure
eas build --platform ios --profile production
```

### 8.5 Submit a App Store

**Metodo 1: Upload Manuale**
1. La build apparira automaticamente in App Store Connect
2. Seleziona la build nella sezione "Build"
3. Completa tutte le informazioni
4. Clicca **"Submit for Review"**

**Metodo 2: Submit Automatico**
```bash
# Configura credenziali Apple
eas credentials --platform ios

# Submit
npm run submit:ios
```

### 8.6 Revisione Apple

- Tempo: 1-3 giorni (tipicamente)
- Piu rigorosa di Google
- Motivi comuni di rifiuto:
  - Crash o bug
  - Violazioni linee guida
  - Metadata incompleto
  - Link non funzionanti

---

## Fase 9: Aggiornamenti Post-Lancio

### 9.1 Over-the-Air Updates (OTA)

Per aggiornamenti JS senza ri-sottomettere agli store:

```bash
# Pubblica aggiornamento OTA
npm run update

# Con messaggio
eas update --message "Fix bug login"
```

**Nota:** OTA funziona solo per modifiche JavaScript. Modifiche native richiedono nuova build.

### 9.2 Nuove Versioni

Per nuove versioni con modifiche native:

1. Aggiorna versione in `app.json`:
```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

2. Build e submit:
```bash
npm run build:prod:android
npm run submit:android

npm run build:prod:ios
npm run submit:ios
```

### 9.3 Monitoraggio

- **Google Play Console:** Crash reports, reviews, statistics
- **App Store Connect:** Crash reports, reviews, statistics
- **Firebase:** Analytics, Crashlytics (opzionale)

---

## Checklist Finale

### Pre-Build
- [ ] Node.js v18+ installato
- [ ] EAS CLI installato (`npm install -g eas-cli`)
- [ ] Login EAS completato (`eas login`)
- [ ] Firebase configurato e funzionante
- [ ] File `.env` con credenziali Firebase
- [ ] Icone app preparate (1024x1024)
- [ ] Splash screen preparato

### Account
- [ ] Account Expo creato
- [ ] Account Google Play Developer (€25)
- [ ] Account Apple Developer (€99/anno)

### Store Preparation
- [ ] Screenshot preparati
- [ ] Descrizione app scritta
- [ ] Privacy policy online
- [ ] Categoria app scelta

### Build & Submit
- [ ] Build preview testata su dispositivo
- [ ] Build production creata
- [ ] App caricata su Google Play Console
- [ ] App caricata su App Store Connect
- [ ] Review superata

### Post-Launch
- [ ] Monitoring attivo
- [ ] Processo aggiornamenti definito
- [ ] Backup credenziali sicuro

---

## Comandi Rapidi

```bash
# Sviluppo
npm start                    # Avvia dev server
npm run web                  # Solo web

# Build
npm run build:preview:android  # APK test
npm run build:preview:ios      # iOS test
npm run build:prod:android     # AAB produzione
npm run build:prod:ios         # iOS produzione

# Submit
npm run submit:android       # Pubblica su Play Store
npm run submit:ios           # Pubblica su App Store

# Updates
npm run update               # OTA update
```

---

## Supporto

Per problemi o domande:
- **WhatsApp:** [Francesco Busanca](https://wa.me/393891815566)
- **Instagram:** [@francesco.busanca](https://www.instagram.com/francesco.busanca)
- **Expo Docs:** [docs.expo.dev](https://docs.expo.dev)
- **EAS Docs:** [docs.expo.dev/eas](https://docs.expo.dev/eas)

---

*Guida creata: Febbraio 2026*
*Versione: 1.0*
