import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Contenuto, TipoContenuto, DiarioEntry, TestPosturale, ImmaginePosturale } from '../types';

// ============================================
// HELPERS
// ============================================

const convertTimestamp = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

const toFirestoreData = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'object' && item !== null && !(item instanceof Date)) {
          return toFirestoreData(item as Record<string, unknown>);
        }
        if (item instanceof Date) {
          return Timestamp.fromDate(item);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result;
};

// ============================================
// SERVIZIO CONTENUTI
// ============================================

export const contenutiService = {
  // Crea contenuto
  async create(contenutoData: Omit<Contenuto, 'id' | 'createdAt'>): Promise<Contenuto> {
    try {
      const docRef = doc(collection(db, 'contenuti'));
      const now = new Date();
      const contenuto = { ...contenutoData, createdAt: now };

      await setDoc(docRef, toFirestoreData(contenuto as unknown as Record<string, unknown>));
      return { id: docRef.id, ...contenuto };
    } catch (error) {
      console.error('Errore create contenuto:', error);
      throw error;
    }
  },

  // Ottieni contenuto per ID
  async getById(contenutoId: string): Promise<Contenuto | null> {
    try {
      const docRef = await getDoc(doc(db, 'contenuti', contenutoId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        titolo: data.titolo,
        descrizione: data.descrizione,
        tipo: data.tipo as TipoContenuto,
        url: data.url,
        categoria: data.categoria,
        creatoDa: data.creatoDa,
        visibileA: data.visibileA,
        createdAt: convertTimestamp(data.createdAt),
      };
    } catch (error) {
      console.error('Errore getById contenuto:', error);
      throw error;
    }
  },

  // Ottieni contenuti per allievo
  async getByAllievo(allievoId: string): Promise<Contenuto[]> {
    try {
      // Contenuti visibili a tutti o specificamente a questo allievo
      const qTutti = query(
        collection(db, 'contenuti'),
        where('visibileA', '==', 'tutti'),
        orderBy('createdAt', 'desc')
      );

      const qSpecifico = query(
        collection(db, 'contenuti'),
        where('visibileA', 'array-contains', allievoId),
        orderBy('createdAt', 'desc')
      );

      const [snapshotTutti, snapshotSpecifico] = await Promise.all([
        getDocs(qTutti),
        getDocs(qSpecifico),
      ]);

      const contenuti: Contenuto[] = [];
      const ids = new Set<string>();

      const processDoc = (docSnap: { id: string; data: () => Record<string, unknown> }) => {
        if (ids.has(docSnap.id)) return;
        ids.add(docSnap.id);

        const data = docSnap.data();
        contenuti.push({
          id: docSnap.id,
          titolo: data.titolo as string,
          descrizione: data.descrizione as string,
          tipo: data.tipo as TipoContenuto,
          url: data.url as string,
          categoria: data.categoria as string,
          creatoDa: data.creatoDa as string,
          visibileA: data.visibileA as 'tutti' | string[],
          createdAt: convertTimestamp(data.createdAt as Timestamp),
        });
      };

      snapshotTutti.docs.forEach(d => processDoc(d as unknown as { id: string; data: () => Record<string, unknown> }));
      snapshotSpecifico.docs.forEach(d => processDoc(d as unknown as { id: string; data: () => Record<string, unknown> }));

      return contenuti.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Errore getByAllievo contenuti:', error);
      throw error;
    }
  },

  // Ottieni contenuti per tipo
  async getByTipo(tipo: TipoContenuto): Promise<Contenuto[]> {
    try {
      const q = query(
        collection(db, 'contenuti'),
        where('tipo', '==', tipo),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titolo: data.titolo,
          descrizione: data.descrizione,
          tipo: data.tipo as TipoContenuto,
          url: data.url,
          categoria: data.categoria,
          creatoDa: data.creatoDa,
          visibileA: data.visibileA,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getByTipo contenuti:', error);
      throw error;
    }
  },

  // Ottieni contenuti creati da utente
  async getByCreatore(userId: string): Promise<Contenuto[]> {
    try {
      const q = query(
        collection(db, 'contenuti'),
        where('creatoDa', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titolo: data.titolo,
          descrizione: data.descrizione,
          tipo: data.tipo as TipoContenuto,
          url: data.url,
          categoria: data.categoria,
          creatoDa: data.creatoDa,
          visibileA: data.visibileA,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getByCreatore contenuti:', error);
      throw error;
    }
  },

  // Aggiorna contenuto
  async update(contenutoId: string, updates: Partial<Contenuto>): Promise<void> {
    try {
      await updateDoc(doc(db, 'contenuti', contenutoId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update contenuto:', error);
      throw error;
    }
  },

  // Elimina contenuto
  async delete(contenutoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contenuti', contenutoId));
    } catch (error) {
      console.error('Errore delete contenuto:', error);
      throw error;
    }
  },

  // Ottieni tutti i contenuti
  async getAll(): Promise<Contenuto[]> {
    try {
      const q = query(collection(db, 'contenuti'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titolo: data.titolo,
          descrizione: data.descrizione,
          tipo: data.tipo as TipoContenuto,
          url: data.url,
          categoria: data.categoria,
          creatoDa: data.creatoDa,
          visibileA: data.visibileA,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getAll contenuti:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO DIARIO
// ============================================

export const diarioService = {
  // Crea entry diario
  async create(entryData: Omit<DiarioEntry, 'id' | 'createdAt'>): Promise<DiarioEntry> {
    try {
      const docRef = doc(collection(db, 'diario'));
      const now = new Date();
      const entry = { ...entryData, createdAt: now };

      await setDoc(docRef, toFirestoreData(entry as unknown as Record<string, unknown>));
      return { id: docRef.id, ...entry };
    } catch (error) {
      console.error('Errore create diario entry:', error);
      throw error;
    }
  },

  // Ottieni entries per allievo
  async getByAllievo(allievoId: string): Promise<DiarioEntry[]> {
    try {
      const q = query(
        collection(db, 'diario'),
        where('allievoId', '==', allievoId),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          allievoId: data.allievoId,
          data: convertTimestamp(data.data),
          umore: data.umore,
          note: data.note,
          immagini: data.immagini,
          condiviso: data.condiviso,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getByAllievo diario:', error);
      throw error;
    }
  },

  // Ottieni entries condivise per allievo (visibili al coach)
  async getCondivise(allievoId: string): Promise<DiarioEntry[]> {
    try {
      const q = query(
        collection(db, 'diario'),
        where('allievoId', '==', allievoId),
        where('condiviso', '==', true),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          allievoId: data.allievoId,
          data: convertTimestamp(data.data),
          umore: data.umore,
          note: data.note,
          immagini: data.immagini,
          condiviso: data.condiviso,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getCondivise diario:', error);
      throw error;
    }
  },

  // Aggiorna entry
  async update(entryId: string, updates: Partial<DiarioEntry>): Promise<void> {
    try {
      await updateDoc(doc(db, 'diario', entryId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update diario:', error);
      throw error;
    }
  },

  // Elimina entry
  async delete(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'diario', entryId));
    } catch (error) {
      console.error('Errore delete diario:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO TEST POSTURALI
// ============================================

export const testPosturaliService = {
  // Crea test posturale
  async create(testData: Omit<TestPosturale, 'id'>): Promise<TestPosturale> {
    try {
      const docRef = doc(collection(db, 'testPosturali'));
      await setDoc(docRef, toFirestoreData(testData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...testData };
    } catch (error) {
      console.error('Errore create test posturale:', error);
      throw error;
    }
  },

  // Ottieni test per ID
  async getById(testId: string): Promise<TestPosturale | null> {
    try {
      const docRef = await getDoc(doc(db, 'testPosturali', testId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        allievoId: data.allievoId,
        collaboratoreId: data.collaboratoreId,
        data: convertTimestamp(data.data),
        immagini: data.immagini as ImmaginePosturale[],
        noteAutomatiche: data.noteAutomatiche,
        noteManuali: data.noteManuali,
        report: data.report,
      };
    } catch (error) {
      console.error('Errore getById test posturale:', error);
      throw error;
    }
  },

  // Ottieni test per allievo
  async getByAllievo(allievoId: string): Promise<TestPosturale[]> {
    try {
      const q = query(
        collection(db, 'testPosturali'),
        where('allievoId', '==', allievoId),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          data: convertTimestamp(data.data),
          immagini: data.immagini as ImmaginePosturale[],
          noteAutomatiche: data.noteAutomatiche,
          noteManuali: data.noteManuali,
          report: data.report,
        };
      });
    } catch (error) {
      console.error('Errore getByAllievo test posturali:', error);
      throw error;
    }
  },

  // Aggiorna test
  async update(testId: string, updates: Partial<TestPosturale>): Promise<void> {
    try {
      await updateDoc(doc(db, 'testPosturali', testId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update test posturale:', error);
      throw error;
    }
  },

  // Elimina test
  async delete(testId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'testPosturali', testId));
    } catch (error) {
      console.error('Errore delete test posturale:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO UPLOAD FILE
// ============================================

export const uploadService = {
  // Upload immagine
  async uploadImage(
    file: Blob,
    path: string,
    filename: string
  ): Promise<string> {
    try {
      const storageRef = ref(storage, `${path}/${filename}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Errore upload immagine:', error);
      throw error;
    }
  },

  // Elimina file
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Errore delete file:', error);
      throw error;
    }
  },

  // Upload immagine diario
  async uploadDiarioImage(allievoId: string, file: Blob): Promise<string> {
    const filename = `${Date.now()}.jpg`;
    return this.uploadImage(file, `diario/${allievoId}`, filename);
  },

  // Upload immagine test posturale
  async uploadTestPosturaleImage(testId: string, tipo: string, file: Blob): Promise<string> {
    const filename = `${tipo}_${Date.now()}.jpg`;
    return this.uploadImage(file, `testPosturali/${testId}`, filename);
  },

  // Upload contenuto
  async uploadContenuto(userId: string, file: Blob, filename: string): Promise<string> {
    return this.uploadImage(file, `contenuti/${userId}`, filename);
  },
};
