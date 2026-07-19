# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Marketing and lead-generation assets for Francesco Busanca's fitness coaching brand **ESSĒRE** and the **Executive Performance Reset** program. All user-facing content and documentation is in **Italian** — keep it that way when editing or adding content.

Three independent parts:

- `index.html` — static, self-contained landing page ("Contatto Executive") with WhatsApp/Instagram call-to-action buttons. No build step, no dependencies; open it in a browser to preview. Leads tap the WhatsApp button which pre-fills the message "Ciao Francesco, RESET".
- `whatsapp-bot/` — Node.js bot that auto-replies to those WhatsApp leads with AI-generated responses (Claude API). This is the only part of the repo with code, dependencies, and runnable commands.
- `APP_ESSERE_SPECS.md` — design/specification document (in Italian) for a future React Native + Expo + Firebase mobile app. **No app code exists in this repo**; the document defines roles (titolare/collaboratori/allievi), Firestore schema, screens, and roadmap. Treat it as the source of truth if that app is ever scaffolded.

## Commands (whatsapp-bot/)

```bash
cd whatsapp-bot
npm install                  # install dependencies
cp .env.example .env         # then set ANTHROPIC_API_KEY
npm start                    # run the bot; first run prints a QR code to link WhatsApp
```

There are no tests or linters configured. Quick sanity check after edits: `node --check src/index.js src/claude.js src/history.js src/voice.js` (run per file).

## WhatsApp bot architecture

Message flow: incoming WhatsApp message → `src/index.js` (filters groups/status, debounces rapid messages per chat) → `src/history.js` (per-chat conversation history, persisted to `data/conversations.json`, capped at `MAX_HISTORY`, first entry must be role `user`) → `src/claude.js` (Claude Messages API call with the system prompt from `config/system-prompt.md`) → reply sent back on the same chat.

Key mechanisms to preserve when modifying:

- **Owner takeover**: the `message_create` event catches messages sent *by the owner*. Bot-sent messages are excluded via the `botSentIds` set (checked after a 1.5s delay to avoid a race with `sendMessage` resolving). Any other owner message pauses the bot in that chat for `TAKEOVER_MINUTES`; `!bot off` / `!bot on` / `!reset` are owner commands handled there.
- **Debounce**: consecutive messages from a contact within `DEBOUNCE_SECONDS` are joined and answered with a single Claude call.
- **Claude API usage**: default model is `claude-opus-4-8` (override with `CLAUDE_MODEL`). It uses `thinking: {type: "adaptive"}` and reads only `text` content blocks. Do **not** add `temperature`/`top_p`/`top_k` or `budget_tokens` — Opus 4.8 rejects them with a 400. Handle `stop_reason === "refusal"` (reply suppressed).
- **Voice replies**: `src/voice.js` wraps ElevenLabs. Incoming `ptt`/`audio` messages are transcribed (`scribe_v1`) before reaching Claude; replies are synthesized (`eleven_multilingual_v2`, Ogg/Opus) and sent with `sendAudioAsVoice: true` when `VOICE_REPLIES` is `always`, or `auto` and the contact sent a vocal. Everything degrades gracefully to text when `ELEVENLABS_API_KEY` is unset or a call fails.
- **Bot persona**: lives entirely in `config/system-prompt.md` (plain Italian text) — behavior changes should go there, not in code, whenever possible.

Never commit `.env`, `.wwebjs_auth/` (WhatsApp session), or `data/` (conversation history) — they hold secrets and personal data and are gitignored.

## Conventions

- Landing page styling is inline in `index.html` (dark theme, red `#C1121F` accent); keep it a single self-contained file.
- The WhatsApp number and Instagram handle in `index.html` are the real business contact points — don't change them without being asked.
- whatsapp-web.js is an unofficial library (ToS risk documented in `whatsapp-bot/README.md`); don't silently swap it for the official WhatsApp Business API without discussing the trade-offs.
