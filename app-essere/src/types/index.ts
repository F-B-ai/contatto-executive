// App ESSĒRE - Type Definitions

// Ruoli utente
export type UserRole = 'titolare' | 'collaboratore' | 'allievo';

// Utente base
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

// Collaboratore
export interface Collaboratore {
  id: string;
  userId: string;
  percentuale: number; // es. 60 = 60%
  specializzazioni: string[];
  allieviIds: string[];
  attivo: boolean;
}

// Allievo
export interface Allievo {
  id: string;
  userId: string;
  collaboratoreId: string;
  dataInizio: Date;
  obiettivo?: string;
  note?: string;
  attivo: boolean;
}

// Stato sessione
export type StatoSessione = 'programmata' | 'completata' | 'annullata';
export type TipoSessione = 'allenamento' | 'consulenza_nutrizionale' | 'valutazione';

// Sessione
export interface Sessione {
  id: string;
  allievoId: string;
  collaboratoreId: string;
  data: Date;
  durata: number; // minuti
  tipo: TipoSessione;
  stato: StatoSessione;
  annullataOrePrima?: number;
  noteCollaboratore?: string;
  programmaId?: string;
  esercizi?: EsercizioSessione[];
}

// Esercizio nella sessione
export interface EsercizioSessione {
  esercizioId: string;
  serie: number;
  ripetizioni: number | string; // può essere "12-15" o un numero
  recupero: number; // secondi
  note?: string;
}

// Esercizio (libreria)
export interface Esercizio {
  id: string;
  nome: string;
  descrizione: string;
  categoria: CategoriaEsercizio;
  videoUrl?: string;
  immagineUrl?: string;
  istruzioni: string;
}

export type CategoriaEsercizio =
  | 'forza'
  | 'mobilita'
  | 'cardio'
  | 'core'
  | 'stretching'
  | 'funzionale'
  | 'posturale';

// Programma allenamento
export interface Programma {
  id: string;
  nome: string;
  descrizione: string;
  durataSettimane: number;
  creatoDa: string; // userId
  sessioni: SessioneProgramma[];
  assegnatoA: string[]; // allievoIds
  createdAt: Date;
  updatedAt: Date;
}

export interface SessioneProgramma {
  giorno: number; // 1-7
  settimana: number;
  esercizi: EsercizioSessione[];
}

// Pagamento
export type ModalitaPagamento = 'unica' | 'rate';

export interface Pagamento {
  id: string;
  allievoId: string;
  collaboratoreId: string;
  descrizione: string;
  importoTotale: number;
  modalita: ModalitaPagamento;
  rate: Rata[];
  percentualeCollaboratore: number;
  guadagnoCollaboratore: number;
  quotaTitolare: number;
  createdAt: Date;
}

export interface Rata {
  numero: number;
  importo: number;
  scadenza: Date;
  pagata: boolean;
  dataPagamento?: Date;
}

// Spese e Ricavi
export interface Spesa {
  id: string;
  descrizione: string;
  importo: number;
  categoria: CategoriaSpesa;
  data: Date;
  ricorrente: boolean;
}

export type CategoriaSpesa =
  | 'affitto'
  | 'attrezzature'
  | 'marketing'
  | 'utenze'
  | 'personale'
  | 'altro';

export interface Ricavo {
  id: string;
  descrizione: string;
  importo: number;
  categoria: string;
  data: Date;
  pagamentoId?: string;
}

// Test Posturale
export type TipoImmaginePosturale = 'fronte' | 'lato_dx' | 'lato_sx' | 'retro';

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

export interface ImmaginePosturale {
  url: string;
  tipo: TipoImmaginePosturale;
  analisiAI?: AnalisiAI;
}

export interface AnalisiAI {
  puntiRilevati: PuntoCorpo[];
  problemiRilevati: string[];
  suggerimenti: string[];
}

export interface PuntoCorpo {
  nome: string;
  x: number;
  y: number;
  confidenza: number;
}

// Contenuti speciali
export type TipoContenuto = 'podcast' | 'video' | 'documento' | 'link';

export interface Contenuto {
  id: string;
  titolo: string;
  descrizione: string;
  tipo: TipoContenuto;
  url: string;
  categoria: string;
  creatoDa: string;
  visibileA: 'tutti' | string[]; // 'tutti' o array di allievoIds
  createdAt: Date;
}

// Diario
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

// Chat
export type TipoChat = '1to1' | 'gruppo';

export interface Conversazione {
  id: string;
  partecipanti: string[]; // userIds
  tipo: TipoChat;
  ultimoMessaggio?: string;
  ultimoMessaggioAt?: Date;
}

export interface Messaggio {
  id: string;
  conversazioneId: string;
  mittente: string; // userId
  testo: string;
  allegati?: Allegato[];
  letto: boolean;
  createdAt: Date;
}

export interface Allegato {
  tipo: 'immagine' | 'documento';
  url: string;
  nome: string;
}

// Calendario
export interface EventoCalendario {
  id: string;
  titolo: string;
  descrizione?: string;
  data: Date;
  oraInizio: string; // "HH:mm"
  oraFine: string;   // "HH:mm"
  tipo: 'sessione' | 'evento' | 'reminder';
  userId: string; // proprietario
  allievoId?: string;
  collaboratoreId?: string;
  sessioneId?: string;
  colore: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  TitolareHome: undefined;
  CollaboratoreHome: undefined;
  AllievoHome: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
