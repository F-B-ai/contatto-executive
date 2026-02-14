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
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Sessione, StatoSessione, TipoSessione, EventoCalendario } from '../types';

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
    } else {
      result[key] = value;
    }
  }
  return result;
};

const sessioneFromDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): Sessione => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    allievoId: data.allievoId as string,
    collaboratoreId: data.collaboratoreId as string,
    data: convertTimestamp(data.data as Timestamp),
    durata: data.durata as number,
    tipo: data.tipo as TipoSessione,
    stato: data.stato as StatoSessione,
    noteCollaboratore: data.noteCollaboratore as string | undefined,
    programmaId: data.programmaId as string | undefined,
  };
};

// ============================================
// SERVIZIO SESSIONI
// ============================================

export const sessioniService = {
  // Crea nuova sessione
  async create(sessioneData: Omit<Sessione, 'id'>): Promise<Sessione> {
    try {
      const docRef = doc(collection(db, 'sessioni'));
      await setDoc(docRef, toFirestoreData(sessioneData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...sessioneData };
    } catch (error) {
      console.error('Errore create sessione:', error);
      throw error;
    }
  },

  // Ottieni sessione per ID
  async getById(sessioneId: string): Promise<Sessione | null> {
    try {
      const docRef = await getDoc(doc(db, 'sessioni', sessioneId));
      if (!docRef.exists()) return null;
      return sessioneFromDoc(docRef as unknown as { id: string; data: () => Record<string, unknown> });
    } catch (error) {
      console.error('Errore getById sessione:', error);
      throw error;
    }
  },

  // Aggiorna sessione
  async update(sessioneId: string, updates: Partial<Sessione>): Promise<void> {
    try {
      await updateDoc(doc(db, 'sessioni', sessioneId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update sessione:', error);
      throw error;
    }
  },

  // Elimina sessione
  async delete(sessioneId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'sessioni', sessioneId));
    } catch (error) {
      console.error('Errore delete sessione:', error);
      throw error;
    }
  },

  // Ottieni sessioni per allievo
  async getByAllievo(allievoId: string, stato?: StatoSessione): Promise<Sessione[]> {
    try {
      let q = query(
        collection(db, 'sessioni'),
        where('allievoId', '==', allievoId),
        orderBy('data', 'desc')
      );

      if (stato) {
        q = query(
          collection(db, 'sessioni'),
          where('allievoId', '==', allievoId),
          where('stato', '==', stato),
          orderBy('data', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => sessioneFromDoc(doc as unknown as { id: string; data: () => Record<string, unknown> }));
    } catch (error) {
      console.error('Errore getByAllievo:', error);
      throw error;
    }
  },

  // Ottieni sessioni per collaboratore
  async getByCollaboratore(collaboratoreId: string, stato?: StatoSessione): Promise<Sessione[]> {
    try {
      let q = query(
        collection(db, 'sessioni'),
        where('collaboratoreId', '==', collaboratoreId),
        orderBy('data', 'desc')
      );

      if (stato) {
        q = query(
          collection(db, 'sessioni'),
          where('collaboratoreId', '==', collaboratoreId),
          where('stato', '==', stato),
          orderBy('data', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => sessioneFromDoc(doc as unknown as { id: string; data: () => Record<string, unknown> }));
    } catch (error) {
      console.error('Errore getByCollaboratore:', error);
      throw error;
    }
  },

  // Ottieni sessioni di oggi
  async getSessioniOggi(collaboratoreId?: string): Promise<Sessione[]> {
    try {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      const domani = new Date(oggi);
      domani.setDate(domani.getDate() + 1);

      let q;
      if (collaboratoreId) {
        q = query(
          collection(db, 'sessioni'),
          where('collaboratoreId', '==', collaboratoreId),
          where('data', '>=', Timestamp.fromDate(oggi)),
          where('data', '<', Timestamp.fromDate(domani)),
          orderBy('data', 'asc')
        );
      } else {
        q = query(
          collection(db, 'sessioni'),
          where('data', '>=', Timestamp.fromDate(oggi)),
          where('data', '<', Timestamp.fromDate(domani)),
          orderBy('data', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => sessioneFromDoc(doc as unknown as { id: string; data: () => Record<string, unknown> }));
    } catch (error) {
      console.error('Errore getSessioniOggi:', error);
      throw error;
    }
  },

  // Ottieni sessioni in un range di date
  async getByDateRange(startDate: Date, endDate: Date, collaboratoreId?: string): Promise<Sessione[]> {
    try {
      let q;
      if (collaboratoreId) {
        q = query(
          collection(db, 'sessioni'),
          where('collaboratoreId', '==', collaboratoreId),
          where('data', '>=', Timestamp.fromDate(startDate)),
          where('data', '<=', Timestamp.fromDate(endDate)),
          orderBy('data', 'asc')
        );
      } else {
        q = query(
          collection(db, 'sessioni'),
          where('data', '>=', Timestamp.fromDate(startDate)),
          where('data', '<=', Timestamp.fromDate(endDate)),
          orderBy('data', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => sessioneFromDoc(doc as unknown as { id: string; data: () => Record<string, unknown> }));
    } catch (error) {
      console.error('Errore getByDateRange:', error);
      throw error;
    }
  },

  // Completa sessione
  async completa(sessioneId: string, note?: string): Promise<void> {
    try {
      const updates: Partial<Sessione> = {
        stato: 'completata',
      };
      if (note) {
        updates.noteCollaboratore = note;
      }
      await this.update(sessioneId, updates);
    } catch (error) {
      console.error('Errore completa sessione:', error);
      throw error;
    }
  },

  // Annulla sessione (con controllo 10 ore)
  async annulla(sessioneId: string): Promise<{ success: boolean; message: string }> {
    try {
      const sessione = await this.getById(sessioneId);
      if (!sessione) {
        return { success: false, message: 'Sessione non trovata' };
      }

      const now = new Date();
      const sessioneDate = sessione.data;
      const diffHours = (sessioneDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 10) {
        return {
          success: false,
          message: 'Non puoi annullare una sessione con meno di 10 ore di preavviso',
        };
      }

      await this.update(sessioneId, { stato: 'annullata' });
      return { success: true, message: 'Sessione annullata con successo' };
    } catch (error) {
      console.error('Errore annulla sessione:', error);
      throw error;
    }
  },

  // Conta sessioni completate per allievo
  async countCompletate(allievoId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'sessioni'),
        where('allievoId', '==', allievoId),
        where('stato', '==', 'completata')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Errore countCompletate:', error);
      throw error;
    }
  },

  // Prossima sessione per allievo
  async getProssimaSessione(allievoId: string): Promise<Sessione | null> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'sessioni'),
        where('allievoId', '==', allievoId),
        where('stato', '==', 'programmata'),
        where('data', '>=', Timestamp.fromDate(now)),
        orderBy('data', 'asc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return sessioneFromDoc(snapshot.docs[0] as unknown as { id: string; data: () => Record<string, unknown> });
    } catch (error) {
      console.error('Errore getProssimaSessione:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO CALENDARIO
// ============================================

export const calendarioService = {
  // Crea evento
  async create(eventoData: Omit<EventoCalendario, 'id'>): Promise<EventoCalendario> {
    try {
      const docRef = doc(collection(db, 'calendario'));
      await setDoc(docRef, toFirestoreData(eventoData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...eventoData };
    } catch (error) {
      console.error('Errore create evento:', error);
      throw error;
    }
  },

  // Ottieni eventi per utente
  async getByUser(userId: string, startDate: Date, endDate: Date): Promise<EventoCalendario[]> {
    try {
      const q = query(
        collection(db, 'calendario'),
        where('userId', '==', userId),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate)),
        orderBy('data', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titolo: data.titolo,
          descrizione: data.descrizione,
          data: convertTimestamp(data.data as Timestamp),
          oraInizio: data.oraInizio,
          oraFine: data.oraFine,
          userId: data.userId,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          sessioneId: data.sessioneId,
          colore: data.colore,
        };
      });
    } catch (error) {
      console.error('Errore getByUser calendario:', error);
      throw error;
    }
  },

  // Ottieni tutti gli eventi (per titolare)
  async getAll(startDate: Date, endDate: Date): Promise<EventoCalendario[]> {
    try {
      const q = query(
        collection(db, 'calendario'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate)),
        orderBy('data', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titolo: data.titolo,
          descrizione: data.descrizione,
          data: convertTimestamp(data.data as Timestamp),
          oraInizio: data.oraInizio,
          oraFine: data.oraFine,
          userId: data.userId,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          sessioneId: data.sessioneId,
          colore: data.colore,
        };
      });
    } catch (error) {
      console.error('Errore getAll calendario:', error);
      throw error;
    }
  },

  // Aggiorna evento
  async update(eventoId: string, updates: Partial<EventoCalendario>): Promise<void> {
    try {
      await updateDoc(doc(db, 'calendario', eventoId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update evento:', error);
      throw error;
    }
  },

  // Elimina evento
  async delete(eventoId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'calendario', eventoId));
    } catch (error) {
      console.error('Errore delete evento:', error);
      throw error;
    }
  },
};
