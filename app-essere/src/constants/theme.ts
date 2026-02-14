// ============================================
// COLORI APP ESSERE
// ============================================

export const COLORS = {
  // Colori primari
  primary: '#1a1a2e',
  primaryLight: '#16213e',
  primaryDark: '#0f0f1a',

  // Accenti
  accent: '#e94560',
  accentLight: '#ff6b6b',
  accentDark: '#c73e54',

  // Successo/Errore/Warning
  success: '#00d9a5',
  error: '#ff4757',
  warning: '#ffa502',
  info: '#3498db',

  // Neutri
  white: '#ffffff',
  black: '#000000',
  background: '#f8f9fa',
  surface: '#ffffff',

  // Grigi
  gray100: '#f7f7f7',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Testo
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#ffffff',
  textMuted: '#9e9e9e',

  // Colori ruoli
  titolare: '#9b59b6',
  collaboratore: '#3498db',
  allievo: '#2ecc71',

  // Colori calendario
  calendarToday: '#e94560',
  calendarSelected: '#1a1a2e',
  calendarEvent: '#3498db',
};

// ============================================
// SPAZIATURE
// ============================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================
// TIPOGRAFIA
// ============================================

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

// ============================================
// BORDI E OMBRE
// ============================================

export const BORDERS = {
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 16,
  radiusXLarge: 24,
  radiusFull: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ============================================
// DIMENSIONI
// ============================================

export const SIZES = {
  buttonHeight: 48,
  inputHeight: 48,
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  headerHeight: 56,
  tabBarHeight: 60,
};
