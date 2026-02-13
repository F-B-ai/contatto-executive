// App ESSĒRE - Session Service
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
import { Sessione, StatoSessione, TipoSessione, EsercizioSessione } from '../types';
import { BUSINESS_RULES } from '../constants/theme';

// Helper per convertire Firestore doc a Sessione
const docToSessione = (doc: any): Sessione => {
  const data = doc.data();
  return {
    id: doc.id,
    allievoId: data.allievoId,
    collaboratoreId: data.collaboratoreId,
    data: data.data?.toDate(),
    durata: data.durata,
    tipo: data.tipo,
    stato: data.stato,
    annullataOrePrima: data.annullataOrePrima,
    noteCollaboratore: data.noteCollaboratore,
    programmaId: data.programmaId,
    esercizi: data.esercizi,
  };
};

// ============ CRUD SESSIONI ============

export const getSessione = async (sessioneId: string): Promise<Sessione | null> => {
  const docRef = doc(db, COLLECTIONS.SESSIONI, sessioneId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToSessione(docSnap);
  }
  return null;
};

export const createSessione = async (
  data: Omit<Sessione, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONI), {
    ...data,
    data: Timestamp.fromDate(data.data),
    stato: 'programmata',
  });
  return docRef.id;
};

export const updateSessione = async (
  sessioneId: string,
  data: Partial<Sessione>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SESSIONI, sessioneId);
  const updateData: any = { ...data };

  if (data.data) {
    updateData.data = Timestamp.fromDate(data.data);
  }

  await updateDoc(docRef, updateData);
};

export const deleteSessione = async (sessioneId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SESSIONI, sessioneId);
  await deleteDoc(docRef);
};

// ============ QUERY SESSIONI ============

// Sessioni per allievo
export const getSessioniByAllievo = async (
  allievoId: string,
  stato?: StatoSessione
): Promise<Sessione[]> => {
  let q = query(
    collection(db, COLLECTIONS.SESSIONI),
    where('allievoId', '==', allievoId),
    orderBy('data', 'desc')
  );

  if (stato) {
    q = query(
      collection(db, COLLECTIONS.SESSIONI),
      where('allievoId', '==', allievoId),
      where('stato', '==', stato),
      orderBy('data', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToSessione);
};

// Sessioni per collaboratore
export const getSessioniByCollaboratore = async (
  collaboratoreId: string,
  stato?: StatoSessione
): Promise<Sessione[]> => {
  let q = query(
    collection(db, COLLECTIONS.SESSIONI),
    where('collaboratoreId', '==', collaboratoreId),
    orderBy('data', 'desc')
  );

  if (stato) {
    q = query(
      collection(db, COLLECTIONS.SESSIONI),
      where('collaboratoreId', '==', collaboratoreId),
      where('stato', '==', stato),
      orderBy('data', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToSessione);
};

// Sessioni per data (range)
export const getSessioniByDateRange = async (
  startDate: Date,
  endDate: Date,
  collaboratoreId?: string
): Promise<Sessione[]> => {
  let q;

  if (collaboratoreId) {
    q = query(
      collection(db, COLLECTIONS.SESSIONI),
      where('collaboratoreId', '==', collaboratoreId),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate)),
      orderBy('data', 'asc')
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.SESSIONI),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate)),
      orderBy('data', 'asc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToSessione);
};

// Sessioni di oggi
export const getSessioniOggi = async (
  collaboratoreId?: string
): Promise<Sessione[]> => {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);

  return getSessioniByDateRange(oggi, domani, collaboratoreId);
};

// Prossime sessioni
export const getProssimeSessioni = async (
  userId: string,
  ruolo: 'collaboratore' | 'allievo',
  limit: number = 5
): Promise<Sessione[]> => {
  const now = new Date();
  const field = ruolo === 'collaboratore' ? 'collaboratoreId' : 'allievoId';

  const q = query(
    collection(db, COLLECTIONS.SESSIONI),
    where(field, '==', userId),
    where('stato', '==', 'programmata'),
    where('data', '>=', Timestamp.fromDate(now)),
    orderBy('data', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.slice(0, limit).map(docToSessione);
};

// ============ AZIONI SESSIONI ============

// Completa sessione
export const completaSessione = async (
  sessioneId: string,
  note?: string
): Promise<void> => {
  await updateSessione(sessioneId, {
    stato: 'completata',
    noteCollaboratore: note,
  });
};

// Annulla sessione (con verifica regola 10 ore)
export const annullaSessione = async (
  sessioneId: string
): Promise<{ success: boolean; message: string }> => {
  const sessione = await getSessione(sessioneId);

  if (!sessione) {
    return { success: false, message: 'Sessione non trovata' };
  }

  if (sessione.stato !== 'programmata') {
    return { success: false, message: 'Solo sessioni programmate possono essere annullate' };
  }

  const now = new Date();
  const sessionDate = new Date(sessione.data);
  const oreRimaste = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (oreRimaste < BUSINESS_RULES.oreMinimeAnnullamento) {
    return {
      success: false,
      message: `Non puoi annullare meno di ${BUSINESS_RULES.oreMinimeAnnullamento} ore prima della sessione`,
    };
  }

  await updateSessione(sessioneId, {
    stato: 'annullata',
    annullataOrePrima: Math.floor(oreRimaste),
  });

  return { success: true, message: 'Sessione annullata con successo' };
};

// ============ STATISTICHE ============

export const getStatisticheSessioni = async (
  collaboratoreId?: string,
  mese?: Date
): Promise<{
  totali: number;
  completate: number;
  annullate: number;
  programmate: number;
}> => {
  let startDate: Date;
  let endDate: Date;

  if (mese) {
    startDate = new Date(mese.getFullYear(), mese.getMonth(), 1);
    endDate = new Date(mese.getFullYear(), mese.getMonth() + 1, 0, 23, 59, 59);
  } else {
    // Default: mese corrente
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  const sessioni = await getSessioniByDateRange(startDate, endDate, collaboratoreId);

  return {
    totali: sessioni.length,
    completate: sessioni.filter((s) => s.stato === 'completata').length,
    annullate: sessioni.filter((s) => s.stato === 'annullata').length,
    programmate: sessioni.filter((s) => s.stato === 'programmata').length,
  };
};
