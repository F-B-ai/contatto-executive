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
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserRole, Collaboratore, Allievo } from '../types';

// ============================================
// CONVERSIONE TIMESTAMP
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
    } else {
      result[key] = value;
    }
  }
  return result;
};

// ============================================
// SERVIZIO UTENTI
// ============================================

export const userService = {
  // Ottieni utente per ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email,
        nome: data.nome,
        cognome: data.cognome,
        telefono: data.telefono,
        ruolo: data.ruolo as UserRole,
        avatarUrl: data.avatarUrl,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    } catch (error) {
      console.error('Errore getUser:', error);
      throw error;
    }
  },

  // Crea nuovo utente
  async createUser(userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const now = new Date();
      const user: Omit<User, 'id'> = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', userId), toFirestoreData(user as unknown as Record<string, unknown>));

      return { id: userId, ...user };
    } catch (error) {
      console.error('Errore createUser:', error);
      throw error;
    }
  },

  // Aggiorna utente
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, 'users', userId), toFirestoreData(updateData as Record<string, unknown>));
    } catch (error) {
      console.error('Errore updateUser:', error);
      throw error;
    }
  },

  // Ottieni tutti gli utenti per ruolo
  async getUsersByRole(ruolo: UserRole): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('ruolo', '==', ruolo),
        orderBy('cognome')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          nome: data.nome,
          cognome: data.cognome,
          telefono: data.telefono,
          ruolo: data.ruolo as UserRole,
          avatarUrl: data.avatarUrl,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Errore getUsersByRole:', error);
      throw error;
    }
  },

  // Elimina utente
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Errore deleteUser:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO COLLABORATORI
// ============================================

export const collaboratoreService = {
  // Ottieni collaboratore per userId
  async getByUserId(userId: string): Promise<Collaboratore | null> {
    try {
      const q = query(
        collection(db, 'collaboratori'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        percentuale: data.percentuale,
        specializzazioni: data.specializzazioni || [],
        allieviIds: data.allieviIds || [],
        attivo: data.attivo,
      };
    } catch (error) {
      console.error('Errore getByUserId:', error);
      throw error;
    }
  },

  // Ottieni collaboratore per ID
  async getById(collaboratoreId: string): Promise<Collaboratore | null> {
    try {
      const docRef = await getDoc(doc(db, 'collaboratori', collaboratoreId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        userId: data.userId,
        percentuale: data.percentuale,
        specializzazioni: data.specializzazioni || [],
        allieviIds: data.allieviIds || [],
        attivo: data.attivo,
      };
    } catch (error) {
      console.error('Errore getById:', error);
      throw error;
    }
  },

  // Crea collaboratore
  async create(data: Omit<Collaboratore, 'id'>): Promise<Collaboratore> {
    try {
      const docRef = doc(collection(db, 'collaboratori'));
      await setDoc(docRef, data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Errore create collaboratore:', error);
      throw error;
    }
  },

  // Aggiorna collaboratore
  async update(collaboratoreId: string, updates: Partial<Collaboratore>): Promise<void> {
    try {
      await updateDoc(doc(db, 'collaboratori', collaboratoreId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Errore update collaboratore:', error);
      throw error;
    }
  },

  // Ottieni tutti i collaboratori attivi
  async getAllActive(): Promise<Collaboratore[]> {
    try {
      const q = query(
        collection(db, 'collaboratori'),
        where('attivo', '==', true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          percentuale: data.percentuale,
          specializzazioni: data.specializzazioni || [],
          allieviIds: data.allieviIds || [],
          attivo: data.attivo,
        };
      });
    } catch (error) {
      console.error('Errore getAllActive:', error);
      throw error;
    }
  },

  // Aggiungi allievo a collaboratore
  async addAllievo(collaboratoreId: string, allievoId: string): Promise<void> {
    try {
      const collab = await this.getById(collaboratoreId);
      if (!collab) throw new Error('Collaboratore non trovato');

      const allieviIds = [...collab.allieviIds, allievoId];
      await this.update(collaboratoreId, { allieviIds });
    } catch (error) {
      console.error('Errore addAllievo:', error);
      throw error;
    }
  },

  // Rimuovi allievo da collaboratore
  async removeAllievo(collaboratoreId: string, allievoId: string): Promise<void> {
    try {
      const collab = await this.getById(collaboratoreId);
      if (!collab) throw new Error('Collaboratore non trovato');

      const allieviIds = collab.allieviIds.filter(id => id !== allievoId);
      await this.update(collaboratoreId, { allieviIds });
    } catch (error) {
      console.error('Errore removeAllievo:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO ALLIEVI
// ============================================

export const allievoService = {
  // Ottieni allievo per userId
  async getByUserId(userId: string): Promise<Allievo | null> {
    try {
      const q = query(
        collection(db, 'allievi'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        collaboratoreId: data.collaboratoreId,
        dataInizio: convertTimestamp(data.dataInizio),
        obiettivo: data.obiettivo,
        note: data.note,
        attivo: data.attivo,
      };
    } catch (error) {
      console.error('Errore getByUserId:', error);
      throw error;
    }
  },

  // Ottieni allievo per ID
  async getById(allievoId: string): Promise<Allievo | null> {
    try {
      const docRef = await getDoc(doc(db, 'allievi', allievoId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        userId: data.userId,
        collaboratoreId: data.collaboratoreId,
        dataInizio: convertTimestamp(data.dataInizio),
        obiettivo: data.obiettivo,
        note: data.note,
        attivo: data.attivo,
      };
    } catch (error) {
      console.error('Errore getById:', error);
      throw error;
    }
  },

  // Crea allievo
  async create(data: Omit<Allievo, 'id'>): Promise<Allievo> {
    try {
      const docRef = doc(collection(db, 'allievi'));
      await setDoc(docRef, toFirestoreData(data as unknown as Record<string, unknown>));
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Errore create allievo:', error);
      throw error;
    }
  },

  // Aggiorna allievo
  async update(allievoId: string, updates: Partial<Allievo>): Promise<void> {
    try {
      await updateDoc(doc(db, 'allievi', allievoId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update allievo:', error);
      throw error;
    }
  },

  // Ottieni allievi per collaboratore
  async getByCollaboratore(collaboratoreId: string): Promise<Allievo[]> {
    try {
      const q = query(
        collection(db, 'allievi'),
        where('collaboratoreId', '==', collaboratoreId),
        where('attivo', '==', true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          collaboratoreId: data.collaboratoreId,
          dataInizio: convertTimestamp(data.dataInizio),
          obiettivo: data.obiettivo,
          note: data.note,
          attivo: data.attivo,
        };
      });
    } catch (error) {
      console.error('Errore getByCollaboratore:', error);
      throw error;
    }
  },

  // Ottieni tutti gli allievi attivi
  async getAllActive(): Promise<Allievo[]> {
    try {
      const q = query(
        collection(db, 'allievi'),
        where('attivo', '==', true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          collaboratoreId: data.collaboratoreId,
          dataInizio: convertTimestamp(data.dataInizio),
          obiettivo: data.obiettivo,
          note: data.note,
          attivo: data.attivo,
        };
      });
    } catch (error) {
      console.error('Errore getAllActive:', error);
      throw error;
    }
  },
};
