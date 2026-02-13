// App ESSĒRE - Theme Constants

export const COLORS = {
  // Colori primari
  primary: '#1E3A5F',        // Blu scuro - professionale
  primaryLight: '#2E5A8F',
  primaryDark: '#0E2A4F',

  // Colori secondari
  secondary: '#D4AF37',      // Oro - eleganza
  secondaryLight: '#E4BF47',
  secondaryDark: '#C49F27',

  // Colori accent per ruoli
  titolare: '#1E3A5F',       // Blu - Titolare
  collaboratore: '#2E7D32',  // Verde - Collaboratore
  allievo: '#5C6BC0',        // Indaco - Allievo

  // Stati
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Neutrali
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#E0E0E0',

  // Testo
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#000000',

  // Calendario - colori per collaboratori
  calendar: [
    '#1E88E5', // Blu
    '#43A047', // Verde
    '#FB8C00', // Arancio
    '#8E24AA', // Viola
    '#E53935', // Rosso
    '#00ACC1', // Ciano
  ],

  // Stato sessioni
  sessioneProgrammata: '#2196F3',
  sessioneCompletata: '#4CAF50',
  sessioneAnnullata: '#F44336',

  // Pagamenti
  pagato: '#4CAF50',
  inScadenza: '#FFC107',
  scaduto: '#F44336',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  title: 28,
  header: 20,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Limiti business
export const BUSINESS_RULES = {
  oreMinimeAnnullamento: 10, // Ore minime prima della sessione per annullare
  maxRate: 12,               // Numero massimo rate per pagamento
  maxAllievi: 100,           // Max allievi per piano free
  maxCollaboratori: 10,      // Max collaboratori per piano free
};

export const APP_CONFIG = {
  name: 'App ESSĒRE',
  version: '1.0.0',
  bundleId: 'com.essere.app',
};
