// App ESSĒRE - Contenuto Service
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
import { Contenuto, TipoContenuto } from '../types';

// Crea un nuovo contenuto
export const creaContenuto = async (
  data: Omit<Contenuto, 'id' | 'createdAt'>
): Promise<Contenuto> => {
  if (!isConfigured) {
    return {
      id: `content_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
  }

  const contenutoRef = await addDoc(collection(db, COLLECTIONS.CONTENUTI), {
    ...data,
    createdAt: serverTimestamp(),
  });

  return {
    id: contenutoRef.id,
    ...data,
    createdAt: new Date(),
  };
};

// Upload file contenuto
export const uploadContenutoFile = async (
  uri: string,
  tipo: TipoContenuto,
  fileName: string
): Promise<string> => {
  if (!isConfigured) {
    return uri;
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const folder = tipo === 'video' ? 'videos' : tipo === 'podcast' ? 'podcasts' : 'documenti';
  const storageRef = ref(storage, `contenuti/${folder}/${Date.now()}_${fileName}`);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};

// Aggiorna contenuto
export const aggiornaContenuto = async (
  contenutoId: string,
  data: Partial<Contenuto>
): Promise<void> => {
  if (!isConfigured) return;

  await updateDoc(doc(db, COLLECTIONS.CONTENUTI, contenutoId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Elimina contenuto
export const eliminaContenuto = async (contenutoId: string): Promise<void> => {
  if (!isConfigured) return;

  await deleteDoc(doc(db, COLLECTIONS.CONTENUTI, contenutoId));
};

// Ottieni contenuto per ID
export const getContenuto = async (
  contenutoId: string
): Promise<Contenuto | null> => {
  if (!isConfigured) return null;

  const docRef = doc(db, COLLECTIONS.CONTENUTI, contenutoId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    titolo: data.titolo,
    descrizione: data.descrizione,
    tipo: data.tipo,
    url: data.url,
    categoria: data.categoria,
    creatoDa: data.creatoDa,
    visibileA: data.visibileA,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Ottieni tutti i contenuti
export const getAllContenuti = async (): Promise<Contenuto[]> => {
  if (!isConfigured) {
    return getMockContenuti();
  }

  const q = query(
    collection(db, COLLECTIONS.CONTENUTI),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titolo: data.titolo,
      descrizione: data.descrizione,
      tipo: data.tipo,
      url: data.url,
      categoria: data.categoria,
      creatoDa: data.creatoDa,
      visibileA: data.visibileA,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Ottieni contenuti visibili per un allievo
export const getContenutiPerAllievo = async (
  allievoId: string
): Promise<Contenuto[]> => {
  if (!isConfigured) {
    return getMockContenuti();
  }

  // Prima ottieni tutti i contenuti pubblici
  const qPubblici = query(
    collection(db, COLLECTIONS.CONTENUTI),
    where('visibileA', '==', 'tutti'),
    orderBy('createdAt', 'desc')
  );

  const snapshotPubblici = await getDocs(qPubblici);

  // Poi ottieni quelli specifici per l'allievo
  const qSpecifici = query(
    collection(db, COLLECTIONS.CONTENUTI),
    where('visibileA', 'array-contains', allievoId),
    orderBy('createdAt', 'desc')
  );

  const snapshotSpecifici = await getDocs(qSpecifici);

  const contenuti = new Map<string, Contenuto>();

  [...snapshotPubblici.docs, ...snapshotSpecifici.docs].forEach((doc) => {
    if (!contenuti.has(doc.id)) {
      const data = doc.data();
      contenuti.set(doc.id, {
        id: doc.id,
        titolo: data.titolo,
        descrizione: data.descrizione,
        tipo: data.tipo,
        url: data.url,
        categoria: data.categoria,
        creatoDa: data.creatoDa,
        visibileA: data.visibileA,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    }
  });

  return Array.from(contenuti.values());
};

// Ottieni contenuti per categoria
export const getContenutiPerCategoria = async (
  categoria: string
): Promise<Contenuto[]> => {
  if (!isConfigured) {
    return getMockContenuti().filter((c) => c.categoria === categoria);
  }

  const q = query(
    collection(db, COLLECTIONS.CONTENUTI),
    where('categoria', '==', categoria),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titolo: data.titolo,
      descrizione: data.descrizione,
      tipo: data.tipo,
      url: data.url,
      categoria: data.categoria,
      creatoDa: data.creatoDa,
      visibileA: data.visibileA,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Ottieni contenuti per tipo
export const getContenutiPerTipo = async (
  tipo: TipoContenuto
): Promise<Contenuto[]> => {
  if (!isConfigured) {
    return getMockContenuti().filter((c) => c.tipo === tipo);
  }

  const q = query(
    collection(db, COLLECTIONS.CONTENUTI),
    where('tipo', '==', tipo),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titolo: data.titolo,
      descrizione: data.descrizione,
      tipo: data.tipo,
      url: data.url,
      categoria: data.categoria,
      creatoDa: data.creatoDa,
      visibileA: data.visibileA,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Mock contenuti per testing
const getMockContenuti = (): Contenuto[] => [
  {
    id: 'content_1',
    titolo: 'Introduzione al Fitness',
    descrizione: 'Video introduttivo sui principi base del fitness e del benessere.',
    tipo: 'video',
    url: 'https://example.com/video1.mp4',
    categoria: 'Introduzione',
    creatoDa: 'titolare_1',
    visibileA: 'tutti',
    createdAt: new Date(),
  },
  {
    id: 'content_2',
    titolo: 'Podcast: Nutrizione e Sport',
    descrizione: 'Discussione approfondita su come lalimentazione influenza le performance sportive.',
    tipo: 'podcast',
    url: 'https://example.com/podcast1.mp3',
    categoria: 'Nutrizione',
    creatoDa: 'titolare_1',
    visibileA: 'tutti',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'content_3',
    titolo: 'Guida agli Esercizi Base',
    descrizione: 'Documento PDF con illustrazioni dettagliate degli esercizi fondamentali.',
    tipo: 'documento',
    url: 'https://example.com/guida.pdf',
    categoria: 'Esercizi',
    creatoDa: 'titolare_1',
    visibileA: 'tutti',
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'content_4',
    titolo: 'Stretching Post-Allenamento',
    descrizione: 'Video tutorial completo sulla routine di stretching da fare dopo ogni sessione.',
    tipo: 'video',
    url: 'https://example.com/video2.mp4',
    categoria: 'Stretching',
    creatoDa: 'titolare_1',
    visibileA: 'tutti',
    createdAt: new Date(Date.now() - 259200000),
  },
];

// Categorie disponibili
export const CATEGORIE_CONTENUTI = [
  'Introduzione',
  'Nutrizione',
  'Esercizi',
  'Stretching',
  'Recupero',
  'Motivazione',
  'Tecnica',
  'Altro',
];
