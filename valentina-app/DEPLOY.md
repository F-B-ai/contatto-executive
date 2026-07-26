# Deploy su App Store e Google Play

Come pubblicare Valentina su iOS App Store e Android Google Play.

## Step 1: Setup EAS (Expo Application Services)

EAS è il servizio di Expo per fare build delle app.

### Crea account EAS

1. Vai su https://expo.dev e registrati (gratuito)
2. Verifica l'email
3. Vai a https://expo.dev/projects e crea un nuovo progetto
4. Collega il progetto al tuo repository GitHub

### Installa EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configura il progetto

```bash
eas init
```

Questo crea un file `eas.json` nella root.

## Step 2: Build per iOS (iPhone/iPad)

### Prerequisiti

- Account Apple Developer ($99/anno)
- Mac per fare testing (opzionale, ma consigliato)

### Crea Build

```bash
eas build --platform ios --auto-submit
```

`--auto-submit` fa upload automatico su TestFlight (beta testing).

### First Time Setup iOS

La prima volta, EAS chiederà:

1. Apple ID (l'email del tuo account Apple)
2. Password dell'Apple ID
3. Accesso al certificato di firma

EAS crea automaticamente i certificati di firma necessari.

### Quando la Build è Pronta

1. EAS ti manda un link alla build
2. Puoi testarla con TestFlight (https://testflight.apple.com)
3. Quando sei soddisfatto, vai su App Store Connect per fare il submission ufficiale

## Step 3: Build per Android

### Prerequisiti

- Account Google Play ($25 one-time)

### Crea Build

```bash
eas build --platform android
```

La prima volta chiede:

1. Se vuoi un keystore nuovo
2. EAS lo crea automaticamente (gratis)

### Quando la Build è Pronta

1. Scarica il file `.aab` (Android App Bundle)
2. Vai su https://play.google.com/console
3. Crea una nuova app
4. Upload il `.aab` file
5. Compila i dettagli (screenshots, descrizione, privacy policy)
6. Submit per review

## Step 4: Dettagli App Store

### Icone e Screenshot

Prima di fare build finale:

1. Crea un'icona quadrata 1024x1024 (JPEG/PNG)
2. Crea 3-5 screenshot di iPhone 6.7" (1242x2688)
3. Crea 1-2 screenshot di iPad (2048x2732)

Mettili in `assets/` e aggiorna `app.json`.

### Descrizione App

**Nome**: Valentina Bot Manager

**Descrizione breve** (max 30 char):
```
Bot Manager per Francesco
```

**Descrizione completa**:
```
Gestisci il bot Valentina da iPhone e iPad in tempo reale.

Funzionalità:
✅ Dashboard con conversazioni live
✅ Monitora messaggi in real-time  
✅ Invia messaggi di test
✅ Controlla il bot (pausa/attiva)
✅ Sync automatico

Perfetto per chi gestisce un chatbot con Claude AI e WhatsApp.
```

**Privacy Policy**: Aggiungi una privacy policy su un sito e linkala in `app.json`:

```json
"extra": {
  "privacyUrl": "https://tuo-sito.com/privacy"
}
```

### Categorie

- **iOS**: "Business" o "Productivity"
- **Android**: "Business" o "Tools"

## Step 5: Submission Ufficiale

### iOS

1. Vai su App Store Connect (https://appstoreconnect.apple.com)
2. Crea una nuova app
3. Compila tutte le info (nome, categoria, rating, privacy policy)
4. Upload da EAS
5. Compila screenshot e descrizione
6. Submit per review (1-3 giorni)

### Android

1. Vai su Google Play Console (https://play.google.com/console)
2. Crea una nuova app
3. Upload `.aab` file
4. Compila tutte le info
5. Aggiungi screenshot
6. Submit per review (24-48 ore)

## Step 6: Updates Futuri

Quando vuoi aggiornare l'app:

```bash
# Aumenta la versione in app.json
# "version": "1.0.1"

# Fai build
eas build --platform ios --auto-submit
eas build --platform android

# Upload automaticamente o manualmente su App Store Connect e Play Console
```

## Costi Finali

| Elemento | Costo | Note |
|----------|-------|------|
| Apple Developer Account | $99/anno | Per pubblicare su iOS |
| Google Play Account | $25 one-time | Per pubblicare su Android |
| EAS Builds | Gratuito | Per fare build |
| Firebase | Gratis | Piano Spark sufficiente |
| **Totale Year 1** | ~$124 | Poi solo $99/anno (Apple) |

## Testing Prima di Deploy

Prima di fare submission ufficiale:

1. **TestFlight** (iOS): 
```bash
eas build --platform ios --auto-submit
```

2. **Google Play Internal Testing** (Android):
   - Upload `.aab` su Play Console
   - Crea un "Internal testing" release
   - Invita tester tramite link

## Common Issues

**"Certificate not found"**
→ Esegui `eas build --platform ios --renew`

**"Build failed"**
→ Verifica che `app.json` abbia:
- Bundle ID unique (es. `com.francescobusanca.valentina`)
- Versione corretta
- Package name per Android

**"App rejected"**
→ Leggi le note di rejection, fai i cambiamenti, e re-submit

## Contatti Utili

- EAS Docs: https://docs.expo.dev/eas/
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Firebase Console: https://console.firebase.google.com
