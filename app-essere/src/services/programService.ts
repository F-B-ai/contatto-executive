// App ESSĒRE - Program & Exercise Service
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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import {
  Programma,
  SessioneProgramma,
  Esercizio,
  CategoriaEsercizio,
  EsercizioSessione,
} from '../types';

// ============ ESERCIZI (LIBRERIA) ============

const docToEsercizio = (doc: any): Esercizio => {
  const data = doc.data();
  return {
    id: doc.id,
    nome: data.nome,
    descrizione: data.descrizione,
    categoria: data.categoria,
    videoUrl: data.videoUrl,
    immagineUrl: data.immagineUrl,
    istruzioni: data.istruzioni,
  };
};

export const getEsercizio = async (esercizioId: string): Promise<Esercizio | null> => {
  const docRef = doc(db, COLLECTIONS.ESERCIZI, esercizioId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToEsercizio(docSnap);
  }
  return null;
};

export const getAllEsercizi = async (): Promise<Esercizio[]> => {
  const q = query(collection(db, COLLECTIONS.ESERCIZI), orderBy('nome'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToEsercizio);
};

export const getEserciziByCategoria = async (
  categoria: CategoriaEsercizio
): Promise<Esercizio[]> => {
  const q = query(
    collection(db, COLLECTIONS.ESERCIZI),
    where('categoria', '==', categoria),
    orderBy('nome')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToEsercizio);
};

export const createEsercizio = async (
  data: Omit<Esercizio, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.ESERCIZI), data);
  return docRef.id;
};

export const updateEsercizio = async (
  esercizioId: string,
  data: Partial<Esercizio>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ESERCIZI, esercizioId);
  await updateDoc(docRef, data);
};

export const deleteEsercizio = async (esercizioId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ESERCIZI, esercizioId);
  await deleteDoc(docRef);
};

export const searchEsercizi = async (searchTerm: string): Promise<Esercizio[]> => {
  // Firestore non supporta ricerca full-text, quindi facciamo client-side
  const tutti = await getAllEsercizi();
  const term = searchTerm.toLowerCase();

  return tutti.filter(
    (e) =>
      e.nome.toLowerCase().includes(term) ||
      e.descrizione.toLowerCase().includes(term) ||
      e.categoria.toLowerCase().includes(term)
  );
};

// ============ PROGRAMMI ============

const docToProgramma = (doc: any): Programma => {
  const data = doc.data();
  return {
    id: doc.id,
    nome: data.nome,
    descrizione: data.descrizione,
    durataSettimane: data.durataSettimane,
    creatoDa: data.creatoDa,
    sessioni: data.sessioni || [],
    assegnatoA: data.assegnatoA || [],
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export const getProgramma = async (programmaId: string): Promise<Programma | null> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToProgramma(docSnap);
  }
  return null;
};

export const getAllProgrammi = async (): Promise<Programma[]> => {
  const q = query(collection(db, COLLECTIONS.PROGRAMMI), orderBy('nome'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToProgramma);
};

export const getProgrammiByCreatore = async (userId: string): Promise<Programma[]> => {
  const q = query(
    collection(db, COLLECTIONS.PROGRAMMI),
    where('creatoDa', '==', userId),
    orderBy('nome')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToProgramma);
};

export const getProgrammiByAllievo = async (allievoId: string): Promise<Programma[]> => {
  const q = query(
    collection(db, COLLECTIONS.PROGRAMMI),
    where('assegnatoA', 'array-contains', allievoId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToProgramma);
};

export const createProgramma = async (
  data: Omit<Programma, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date();
  const docRef = await addDoc(collection(db, COLLECTIONS.PROGRAMMI), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateProgramma = async (
  programmaId: string,
  data: Partial<Programma>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteProgramma = async (programmaId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await deleteDoc(docRef);
};

// ============ ASSEGNAZIONE PROGRAMMI ============

export const assegnaProgrammaAllievo = async (
  programmaId: string,
  allievoId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await updateDoc(docRef, {
    assegnatoA: arrayUnion(allievoId),
    updatedAt: new Date(),
  });
};

export const rimuoviProgrammaAllievo = async (
  programmaId: string,
  allievoId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await updateDoc(docRef, {
    assegnatoA: arrayRemove(allievoId),
    updatedAt: new Date(),
  });
};

// ============ GESTIONE SESSIONI PROGRAMMA ============

export const addSessioneToProgramma = async (
  programmaId: string,
  sessione: SessioneProgramma
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await updateDoc(docRef, {
    sessioni: arrayUnion(sessione),
    updatedAt: new Date(),
  });
};

export const updateSessioneInProgramma = async (
  programmaId: string,
  sessioni: SessioneProgramma[]
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PROGRAMMI, programmaId);
  await updateDoc(docRef, {
    sessioni,
    updatedAt: new Date(),
  });
};

// ============ HELPER PER PROGRAMMA GIORNALIERO ============

export const getAllenamentoOggi = async (
  allievoId: string
): Promise<{
  programma: Programma | null;
  sessione: SessioneProgramma | null;
  esercizi: Esercizio[];
}> => {
  const programmi = await getProgrammiByAllievo(allievoId);

  if (programmi.length === 0) {
    return { programma: null, sessione: null, esercizi: [] };
  }

  // Prendi il primo programma attivo (potresti avere logica più complessa)
  const programma = programmi[0];

  // Calcola il giorno della settimana (1 = Lunedì, 7 = Domenica)
  const oggi = new Date();
  let giornoSettimana = oggi.getDay();
  if (giornoSettimana === 0) giornoSettimana = 7; // Domenica = 7

  // Trova la sessione per oggi
  // Assumiamo che settimana = 1 sia la settimana corrente (potresti calcolare in base a dataInizio)
  const sessione = programma.sessioni.find(
    (s) => s.giorno === giornoSettimana && s.settimana === 1
  );

  if (!sessione) {
    return { programma, sessione: null, esercizi: [] };
  }

  // Carica i dettagli degli esercizi
  const eserciziPromises = sessione.esercizi.map((e) => getEsercizio(e.esercizioId));
  const eserciziResults = await Promise.all(eserciziPromises);
  const esercizi = eserciziResults.filter((e): e is Esercizio => e !== null);

  return { programma, sessione, esercizi };
};

// ============ CATEGORIE ESERCIZI ============

export const CATEGORIE_ESERCIZIO: { value: CategoriaEsercizio; label: string }[] = [
  { value: 'forza', label: 'Forza' },
  { value: 'mobilita', label: 'Mobilità' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'core', label: 'Core' },
  { value: 'stretching', label: 'Stretching' },
  { value: 'funzionale', label: 'Funzionale' },
  { value: 'posturale', label: 'Posturale' },
];
