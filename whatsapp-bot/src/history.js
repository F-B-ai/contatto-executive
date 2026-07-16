'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'conversations.json');
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || '40', 10);

let conversations = {};
let saveTimer = null;

function load() {
  try {
    conversations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    conversations = {};
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(conversations, null, 2));
    } catch (err) {
      console.error('[history] impossibile salvare le conversazioni:', err.message);
    }
  }, 2000);
}

function get(chatId) {
  return conversations[chatId] || [];
}

function append(chatId, role, content) {
  const history = conversations[chatId] || [];
  history.push({ role, content });

  // Mantiene solo gli ultimi MAX_HISTORY turni; il primo deve essere 'user'.
  let trimmed = history.slice(-MAX_HISTORY);
  while (trimmed.length && trimmed[0].role !== 'user') {
    trimmed = trimmed.slice(1);
  }

  conversations[chatId] = trimmed;
  scheduleSave();
}

function clear(chatId) {
  delete conversations[chatId];
  scheduleSave();
}

load();

module.exports = { get, append, clear };
