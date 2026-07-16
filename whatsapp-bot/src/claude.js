'use strict';

const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) client = new Anthropic(); // legge ANTHROPIC_API_KEY dall'ambiente
  return client;
}

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';
const MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10);

/**
 * Genera la risposta del bot a partire dallo storico della conversazione.
 * `history` è un array di { role: 'user' | 'assistant', content: string }.
 */
async function generateReply(history, systemPrompt) {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: history,
  });

  if (response.stop_reason === 'refusal') {
    return null;
  }

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  return text || null;
}

/**
 * Traduce gli errori dell'API in un messaggio di log leggibile.
 * Ordine: dal più specifico al più generico (APIConnectionError è una
 * sottoclasse di APIError nell'SDK TypeScript/JS, va controllata prima).
 */
function describeApiError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Chiave API non valida: controlla ANTHROPIC_API_KEY nel file .env';
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Limite di richieste raggiunto (rate limit): il bot riproverà al prossimo messaggio';
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Errore di rete verso l\'API Claude';
  }
  if (err instanceof Anthropic.APIError) {
    return `Errore API Claude (${err.status}): ${err.message}`;
  }
  return `Errore inatteso: ${err.message || err}`;
}

module.exports = { generateReply, describeApiError, MODEL };
