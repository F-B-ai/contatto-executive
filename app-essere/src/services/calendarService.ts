// App ESSĒRE - Calendar Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { EventoCalendario, Sessione } from '../types';
import { COLORS } from '../constants/theme';

// ============ HELPERS ============

const docToEvento = (doc: any): EventoCalendario => {
  const data = doc.data();
  return {
    id: doc.id,
    titolo: data.titolo,
    descrizione: data.descrizione,
    data: data.data?.toDate(),
    oraInizio: data.oraInizio,
    oraFine: data.oraFine,
    tipo: data.tipo,
    userId: data.userId,
    allievoId: data.allievoId,
    collaboratoreId: data.collaboratoreId,
    sessioneId: data.sessioneId,
    colore: data.colore,
  };
};

// ============ CRUD EVENTI ============

export const getEvento = async (eventoId: string): Promise<EventoCalendario | null> => {
  const docRef = doc(db, COLLECTIONS.CALENDARIO, eventoId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToEvento(docSnap);
  }
  return null;
};

export const createEvento = async (
  data: Omit<EventoCalendario, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.CALENDARIO), {
    ...data,
    data: Timestamp.fromDate(data.data),
  });
  return docRef.id;
};

export const updateEvento = async (
  eventoId: string,
  data: Partial<EventoCalendario>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.CALENDARIO, eventoId);
  const updateData: any = { ...data };

  if (data.data) {
    updateData.data = Timestamp.fromDate(data.data);
  }

  await updateDoc(docRef, updateData);
};

export const deleteEvento = async (eventoId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.CALENDARIO, eventoId);
  await deleteDoc(docRef);
};

// ============ QUERY EVENTI ============

export const getEventiByDateRange = async (
  startDate: Date,
  endDate: Date,
  userId?: string,
  collaboratoreId?: string
): Promise<EventoCalendario[]> => {
  let q;

  if (collaboratoreId) {
    q = query(
      collection(db, COLLECTIONS.CALENDARIO),
      where('collaboratoreId', '==', collaboratoreId),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate)),
      orderBy('data', 'asc')
    );
  } else if (userId) {
    q = query(
      collection(db, COLLECTIONS.CALENDARIO),
      where('userId', '==', userId),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate)),
      orderBy('data', 'asc')
    );
  } else {
    // Tutti gli eventi (per titolare)
    q = query(
      collection(db, COLLECTIONS.CALENDARIO),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate)),
      orderBy('data', 'asc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToEvento);
};

// Ottieni eventi per una settimana
export const getEventiSettimana = async (
  data: Date,
  userId?: string,
  collaboratoreId?: string
): Promise<EventoCalendario[]> => {
  const startOfWeek = getStartOfWeek(data);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return getEventiByDateRange(startOfWeek, endOfWeek, userId, collaboratoreId);
};

// Ottieni eventi per un mese
export const getEventiMese = async (
  anno: number,
  mese: number,
  userId?: string,
  collaboratoreId?: string
): Promise<EventoCalendario[]> => {
  const startDate = new Date(anno, mese, 1);
  const endDate = new Date(anno, mese + 1, 0, 23, 59, 59, 999);

  return getEventiByDateRange(startDate, endDate, userId, collaboratoreId);
};

// ============ CONVERSIONE SESSIONE -> EVENTO ============

export const sessioneToEvento = (
  sessione: Sessione,
  allievoNome: string,
  collaboratoreIndex: number = 0
): Omit<EventoCalendario, 'id'> => {
  const data = new Date(sessione.data);
  const oraInizio = `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;

  const fineDate = new Date(data.getTime() + sessione.durata * 60000);
  const oraFine = `${String(fineDate.getHours()).padStart(2, '0')}:${String(fineDate.getMinutes()).padStart(2, '0')}`;

  return {
    titolo: allievoNome,
    descrizione: sessione.tipo,
    data: sessione.data,
    oraInizio,
    oraFine,
    tipo: 'sessione',
    userId: sessione.collaboratoreId,
    allievoId: sessione.allievoId,
    collaboratoreId: sessione.collaboratoreId,
    sessioneId: sessione.id,
    colore: COLORS.calendar[collaboratoreIndex % COLORS.calendar.length],
  };
};

// ============ HELPERS DATE ============

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì come inizio settimana
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const formatTime = (time: string): string => {
  return time; // Già in formato HH:mm
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysInMonth = (anno: number, mese: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(anno, mese, 1);
  const lastDay = new Date(anno, mese + 1, 0);

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
};

export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const start = getStartOfWeek(startDate);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  return days;
};

// ============ RAGGRUPPA EVENTI PER GIORNO ============

export interface EventiPerGiorno {
  [dateKey: string]: EventoCalendario[];
}

export const raggruppaEventiPerGiorno = (
  eventi: EventoCalendario[]
): EventiPerGiorno => {
  return eventi.reduce((acc, evento) => {
    const dateKey = evento.data.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(evento);
    return acc;
  }, {} as EventiPerGiorno);
};

// ============ COLORI COLLABORATORI ============

export const getColoreCollaboratore = (index: number): string => {
  return COLORS.calendar[index % COLORS.calendar.length];
};

export const GIORNI_SETTIMANA = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];
