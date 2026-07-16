# Bot WhatsApp con AI — ESSĒRE

Bot che risponde automaticamente ai messaggi WhatsApp usando l'AI di Claude (Anthropic), pensato per accogliere e qualificare i contatti che arrivano dalla landing page del programma **Executive Performance Reset**.

> ⚠️ **Avvertenza importante**: questo bot usa [whatsapp-web.js](https://wwebjs.dev/), una libreria **non ufficiale** che collega il bot al tuo account come se fosse "WhatsApp Web". È contro i termini di servizio di WhatsApp e c'è un **rischio concreto di ban del numero**. Consiglio vivamente di provarlo prima con un numero secondario, non con il numero di lavoro principale.

## Cosa fa

- Risponde ai messaggi privati (mai nei gruppi) con risposte AI naturali in italiano, seguendo la personalità definita in `config/system-prompt.md`.
- Ricorda la conversazione con ogni contatto (storico salvato in `data/conversations.json`).
- Raggruppa i messaggi ravvicinati di un contatto e risponde una volta sola.
- **Si mette in pausa da solo** in una chat quando rispondi tu manualmente (default: 60 minuti), così non ti parla sopra.
- Mostra l'indicatore "sta scrivendo…" prima di rispondere.

## Comandi (li invii tu, dal tuo telefono, dentro la chat)

| Comando    | Effetto                                             |
|------------|-----------------------------------------------------|
| `!bot off` | Disattiva il bot in quella chat (finché non lo riattivi) |
| `!bot on`  | Riattiva il bot in quella chat                      |
| `!reset`   | Azzera la memoria della conversazione in quella chat |

## Requisiti

- Node.js 18 o superiore
- Una chiave API Anthropic ([console.anthropic.com](https://console.anthropic.com/settings/keys))

## Installazione

```bash
cd whatsapp-bot
npm install
cp .env.example .env
# apri .env e inserisci la tua ANTHROPIC_API_KEY
```

## Avvio

```bash
npm start
```

Al primo avvio compare un **QR code nel terminale**: scansionalo dal telefono con **WhatsApp → Impostazioni → Dispositivi collegati → Collega un dispositivo**. La sessione viene salvata in `.wwebjs_auth/`, quindi ai riavvii successivi non serve più scansionare.

Il bot deve restare in esecuzione per rispondere: su un server puoi usare [pm2](https://pm2.keymetrics.io/) (`pm2 start src/index.js --name whatsapp-bot`).

## Personalizzazione

- **Personalità e regole del bot**: modifica `config/system-prompt.md` (è testo semplice, riavvia il bot dopo le modifiche).
- **Modello e costi**: il default è `claude-opus-4-8` ($5/$25 per milione di token in input/output). Per risparmiare imposta in `.env` `CLAUDE_MODEL=claude-sonnet-5` oppure `claude-haiku-4-5`. Una risposta tipica costa una frazione di centesimo, ma i costi crescono con il volume di messaggi.
- Altre opzioni (tempi di pausa, memoria, debounce): vedi `.env.example`.

## Note

- Il file `.env`, la sessione WhatsApp (`.wwebjs_auth/`) e lo storico conversazioni (`data/`) sono esclusi da git: contengono dati sensibili e non vanno mai committati.
- Se il bot risponde a qualcosa che non dovrebbe, aggiorna le "Regole ferree" in `config/system-prompt.md`.
