'use strict';

// Sintesi vocale (text-to-speech) e trascrizione (speech-to-text) via ElevenLabs.
// Se ELEVENLABS_API_KEY non è impostata, il bot funziona solo in modalità testo.

const API_BASE = 'https://api.elevenlabs.io/v1';

// Voce di default: "Sarah" (voce femminile predefinita di ElevenLabs, parla italiano).
// Puoi sceglierne un'altra da https://elevenlabs.io/app/voice-library
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
const TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL || 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'opus_48000_64'; // Ogg/Opus: il formato dei vocali di WhatsApp
const VOICE_MIMETYPE = 'audio/ogg; codecs=opus';

// Impostazioni della voce: rendono il parlato più naturale ed espressivo.
// - stability bassa = più espressiva e meno "robotica" (troppo bassa = instabile)
// - similarity_boost alta = resta fedele al timbro della voce scelta
// - style dà intonazione/emozione (0 = piatto, valori alti = più espressivo)
// Tutte regolabili da .env se vuoi ritoccare il risultato.
const VOICE_STABILITY = parseFloat(process.env.ELEVENLABS_STABILITY || '0.4');
const VOICE_SIMILARITY = parseFloat(process.env.ELEVENLABS_SIMILARITY || '0.85');
const VOICE_STYLE = parseFloat(process.env.ELEVENLABS_STYLE || '0.35');

function isConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

// Toglie emoji e markdown: la sintesi vocale li leggerebbe ad alta voce.
function sanitizeForSpeech(text) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[*_~`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function textToVoice(text) {
  const res = await fetch(
    `${API_BASE}/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: sanitizeForSpeech(text),
        model_id: TTS_MODEL,
        voice_settings: {
          stability: VOICE_STABILITY,
          similarity_boost: VOICE_SIMILARITY,
          style: VOICE_STYLE,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const base64 = Buffer.from(await res.arrayBuffer()).toString('base64');
  return { base64, mimetype: VOICE_MIMETYPE };
}

async function transcribeVoice(base64, mimetype) {
  const form = new FormData();
  form.append('model_id', 'scribe_v1');
  form.append(
    'file',
    new Blob([Buffer.from(base64, 'base64')], { type: mimetype }),
    'vocale.ogg'
  );

  const res = await fetch(`${API_BASE}/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.text || '').trim();
}

module.exports = { isConfigured, textToVoice, transcribeVoice };
