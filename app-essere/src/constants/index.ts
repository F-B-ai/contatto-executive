export * from './theme';

// ============================================
// COSTANTI APP
// ============================================

export const APP_NAME = 'App ESSERE';
export const APP_VERSION = '1.0.0';

// Regole business
export const CANCELLATION_HOURS = 10; // Ore minime per annullare sessione

// Categorie spese
export const CATEGORIE_SPESE = [
  'Affitto',
  'Attrezzature',
  'Marketing',
  'Utenze',
  'Manutenzione',
  'Altro',
];

// Categorie esercizi
export const CATEGORIE_ESERCIZI = [
  'Forza',
  'Cardio',
  'Mobilità',
  'Stretching',
  'Funzionale',
  'Core',
  'Posturale',
];

// Tipi sessione labels
export const TIPI_SESSIONE_LABELS = {
  allenamento: 'Allenamento',
  consulenza: 'Consulenza',
  valutazione: 'Valutazione',
};

// Stati sessione labels
export const STATI_SESSIONE_LABELS = {
  programmata: 'Programmata',
  completata: 'Completata',
  annullata: 'Annullata',
};
