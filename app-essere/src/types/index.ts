// ============================================
// TIPI UTENTE E RUOLI
// ============================================

export type UserRole = 'titolare' | 'collaboratore' | 'allievo';

export interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  telefono?: string;
  ruolo: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaboratore {
  id: string;
  userId: string;
  percentuale: number; // es. 60 = 60%
  specializzazioni: string[];
  allieviIds: string[];
  attivo: boolean;
}

export interface Allievo {
  id: string;
  userId: string;
  collaboratoreId: string;
  dataInizio: Date;
  obiettivo?: string;
  note?: string;
  attivo: boolean;
}

// ============================================
// SESSIONI E CALENDARIO
// ============================================

export type TipoSessione = 'allenamento' | 'consulenza' | 'valutazione';
export type StatoSessione = 'programmata' | 'completata' | 'annullata';

export interface Sessione {
  id: string;
  allievoId: string;
  collaboratoreId: string;
  data: Date;
  durata: number; // minuti
  tipo: TipoSessione;
  stato: StatoSessione;
  noteCollaboratore?: string;
  programmaId?: string;
}

export interface EventoCalendario {
  id: string;
  titolo: string;
  descrizione?: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  userId: string;
  allievoId?: string;
  collaboratoreId?: string;
  sessioneId?: string;
  colore: string;
}

// ============================================
// PROGRAMMI E ESERCIZI
// ============================================

export interface Esercizio {
  id: string;
  nome: string;
  descrizione?: string;
  categoria: string;
  videoUrl?: string;
  immagineUrl?: string;
  istruzioni?: string;
}

export interface EsercizioInProgramma {
  esercizioId: string;
  serie: number;
  ripetizioni: string; // es. "8-12" o "10"
  recupero: number; // secondi
  note?: string;
}

export interface SessioneProgramma {
  giorno: number;
  esercizi: EsercizioInProgramma[];
}

export interface Programma {
  id: string;
  nome: string;
  descrizione?: string;
  durataSettimane: number;
  creatoDa: string;
  sessioni: SessioneProgramma[];
  assegnatoA: string[];
}

// ============================================
// SISTEMA ECONOMICO
// ============================================

export type ModalitaPagamento = 'unica' | 'rate';
export type StatoRata = 'pagata' | 'in_scadenza' | 'scaduta';

export interface Rata {
  numero: number;
  importo: number;
  scadenza: Date;
  pagata: boolean;
  dataPagamento?: Date;
}

export interface Pagamento {
  id: string;
  allievoId: string;
  collaboratoreId: string;
  importoTotale: number;
  modalita: ModalitaPagamento;
  rate: Rata[];
  percentualeCollaboratore: number;
  guadagnoCollaboratore: number;
  quotaTitolare: number;
  createdAt: Date;
}

export interface Spesa {
  id: string;
  descrizione: string;
  importo: number;
  categoria: string;
  data: Date;
  ricorrente: boolean;
}

export interface Ricavo {
  id: string;
  descrizione: string;
  importo: number;
  categoria: string;
  data: Date;
  pagamentoId?: string;
}

// ============================================
// CHAT E CONTENUTI
// ============================================

export type TipoConversazione = '1to1' | 'gruppo';

export interface Messaggio {
  id: string;
  mittente: string;
  testo: string;
  allegati?: string[];
  letto: boolean;
  createdAt: Date;
}

export interface Conversazione {
  id: string;
  partecipanti: string[];
  tipo: TipoConversazione;
  ultimoMessaggio?: string;
  ultimoMessaggioAt?: Date;
}

export type TipoContenuto = 'podcast' | 'video' | 'documento' | 'link';

export interface Contenuto {
  id: string;
  titolo: string;
  descrizione?: string;
  tipo: TipoContenuto;
  url: string;
  categoria: string;
  creatoDa: string;
  visibileA: 'tutti' | string[];
  createdAt: Date;
}

// ============================================
// DIARIO E TEST POSTURALI
// ============================================

export interface DiarioEntry {
  id: string;
  allievoId: string;
  data: Date;
  umore: number; // 1-10
  note?: string;
  immagini?: string[];
  condiviso: boolean;
  createdAt: Date;
}

export type TipoImmaginePosturale = 'fronte' | 'lato_dx' | 'lato_sx' | 'retro';

export interface ImmaginePosturale {
  url: string;
  tipo: TipoImmaginePosturale;
  analisiAI?: Record<string, unknown>;
}

export interface TestPosturale {
  id: string;
  allievoId: string;
  collaboratoreId: string;
  data: Date;
  immagini: ImmaginePosturale[];
  noteAutomatiche?: string;
  noteManuali?: string;
  report?: string;
}

// ============================================
// NAVIGAZIONE
// ============================================

export type RootStackParamList = {
  Auth: undefined;
  Titolare: undefined;
  Collaboratore: undefined;
  Allievo: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type TitolareTabParamList = {
  Dashboard: undefined;
  Calendario: undefined;
  Collaboratori: undefined;
  Allievi: undefined;
  Economia: undefined;
};

export type CollaboratoreTabParamList = {
  Home: undefined;
  Calendario: undefined;
  Allievi: undefined;
  Economia: undefined;
  Programmi: undefined;
};

export type AllievoTabParamList = {
  Home: undefined;
  Programma: undefined;
  Calendario: undefined;
  Contenuti: undefined;
  Profilo: undefined;
};
