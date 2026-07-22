'use strict';

// Eccezioni manuali allo stato "cliente/lead" di un contatto, impostate con
// i comandi !cliente / !lead. Il rilevamento automatico (contatto salvato in
// rubrica = cliente) resta il comportamento di default; questo file serve
// solo a correggere i casi in cui Francesco vuole forzare l'altro stato.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'contact-overrides.json');

let overrides = {};

function load() {
  try {
    overrides = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    overrides = {};
  }
}

function save() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(overrides, null, 2));
  } catch (err) {
    console.error('[contacts] impossibile salvare le eccezioni di stato contatto:', err.message);
  }
}

// Ritorna 'cliente', 'lead', o undefined se non c'è un'eccezione manuale.
function getOverride(chatId) {
  return overrides[chatId];
}

function setOverride(chatId, status) {
  overrides[chatId] = status;
  save();
}

load();

module.exports = { getOverride, setOverride };
