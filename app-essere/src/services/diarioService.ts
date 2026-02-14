// App ESSĒRE - Diario Service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, COLLECTIONS, isConfigured } from './firebase';
import { DiarioEntry } from '../types';

// Crea una nuova entry nel diario
export const creaDiarioEntry = async (
  allievoId: string,
  data: {
    umore: number;
    note?: string;
    immagini?: string[];
    condiviso: boolean;
  }
): Promise<DiarioEntry> => {
  if (!isConfigured) {
    // Mock per testing
    return {
      id: `diary_${Date.now()}`,
      allievoId,
      data: new Date(),
      umore: data.umore,
      note: data.note,
      immagini: data.immagini,
      condiviso: data.condiviso,
      createdAt: new Date(),
    };
  }

  const entryRef = await addDoc(collection(db, COLLECTIONS.DIARIO), {
    allievoId,
    data: new Date(),
    umore: data.umore,
    note: data.note || '',
    immagini: data.immagini || [],
    condiviso: data.condiviso,
    createdAt: serverTimestamp(),
  });

  return {
    id: entryRef.id,
    allievoId,
    data: new Date(),
    umore: data.umore,
    note: data.note,
    immagini: data.immagini,
    condiviso: data.condiviso,
    createdAt: new Date(),
  };
};

// Aggiorna una entry del diario
export const aggiornaDiarioEntry = async (
  entryId: string,
  data: Partial<DiarioEntry>
): Promise<void> => {
  if (!isConfigured) return;

  await updateDoc(doc(db, COLLECTIONS.DIARIO, entryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Elimina una entry del diario
export const eliminaDiarioEntry = async (entryId: string): Promise<void> => {
  if (!isConfigured) return;

  await deleteDoc(doc(db, COLLECTIONS.DIARIO, entryId));
};

// Ottieni entry per ID
export const getDiarioEntry = async (
  entryId: string
): Promise<DiarioEntry | null> => {
  if (!isConfigured) return null;

  const docRef = doc(db, COLLECTIONS.DIARIO, entryId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    allievoId: data.allievoId,
    data: data.data?.toDate() || new Date(),
    umore: data.umore,
    note: data.note,
    immagini: data.immagini,
    condiviso: data.condiviso,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Ottieni tutte le entries del diario di un allievo
export const getDiarioEntries = async (
  allievoId: string
): Promise<DiarioEntry[]> => {
  if (!isConfigured) {
    // Mock per testing
    return [
      {
        id: 'diary_1',
        allievoId,
        data: new Date(),
        umore: 8,
        note: 'Oggi mi sono allenato bene! Ho fatto tutti gli esercizi senza problemi.',
        immagini: [],
        condiviso: true,
        createdAt: new Date(),
      },
      {
        id: 'diary_2',
        allievoId,
        data: new Date(Date.now() - 86400000),
        umore: 6,
        note: 'Un po stanco oggi, ma ho completato la sessione.',
        immagini: [],
        condiviso: false,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'diary_3',
        allievoId,
        data: new Date(Date.now() - 172800000),
        umore: 9,
        note: 'Giornata fantastica! Ho raggiunto un nuovo record personale.',
        immagini: [],
        condiviso: true,
        createdAt: new Date(Date.now() - 172800000),
      },
    ];
  }

  const q = query(
    collection(db, COLLECTIONS.DIARIO),
    where('allievoId', '==', allievoId),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      allievoId: data.allievoId,
      data: data.data?.toDate() || new Date(),
      umore: data.umore,
      note: data.note,
      immagini: data.immagini,
      condiviso: data.condiviso,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Ottieni entries condivise (per collaboratore)
export const getDiarioEntriesCondivise = async (
  allievoIds: string[]
): Promise<DiarioEntry[]> => {
  if (!isConfigured || allievoIds.length === 0) {
    return [];
  }

  const q = query(
    collection(db, COLLECTIONS.DIARIO),
    where('allievoId', 'in', allievoIds),
    where('condiviso', '==', true),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      allievoId: data.allievoId,
      data: data.data?.toDate() || new Date(),
      umore: data.umore,
      note: data.note,
      immagini: data.immagini,
      condiviso: data.condiviso,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Carica immagine per diario
export const uploadDiarioImmagine = async (
  allievoId: string,
  uri: string,
  fileName: string
): Promise<string> => {
  if (!isConfigured) {
    return uri; // In modalità demo, ritorna l'URI originale
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `diario/${allievoId}/${Date.now()}_${fileName}`
  );
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
};

// Calcola statistiche umore
export const getStatisticheUmore = async (
  allievoId: string,
  giorni: number = 30
): Promise<{
  media: number;
  trend: 'su' | 'giu' | 'stabile';
  entries: number;
}> => {
  const entries = await getDiarioEntries(allievoId);

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - giorni);

  const entriesPeriodo = entries.filter((e) => e.data >= dataLimite);

  if (entriesPeriodo.length === 0) {
    return { media: 0, trend: 'stabile', entries: 0 };
  }

  const sommaUmore = entriesPeriodo.reduce((acc, e) => acc + e.umore, 0);
  const media = sommaUmore / entriesPeriodo.length;

  // Calcola trend comparando prima e seconda metà del periodo
  const meta = Math.floor(entriesPeriodo.length / 2);
  const primaMeta = entriesPeriodo.slice(0, meta);
  const secondaMeta = entriesPeriodo.slice(meta);

  const mediaPrima =
    primaMeta.reduce((acc, e) => acc + e.umore, 0) / (primaMeta.length || 1);
  const mediaSeconda =
    secondaMeta.reduce((acc, e) => acc + e.umore, 0) / (secondaMeta.length || 1);

  let trend: 'su' | 'giu' | 'stabile' = 'stabile';
  if (mediaSeconda - mediaPrima > 0.5) trend = 'su';
  else if (mediaPrima - mediaSeconda > 0.5) trend = 'giu';

  return {
    media: Math.round(media * 10) / 10,
    trend,
    entries: entriesPeriodo.length,
  };
};
