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
  onSnapshot,
  limit,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Conversazione, Messaggio, TipoConversazione } from '../types';

// ============================================
// HELPERS
// ============================================

const convertTimestamp = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// ============================================
// SERVIZIO CONVERSAZIONI
// ============================================

export const conversazioniService = {
  // Crea nuova conversazione
  async create(partecipanti: string[], tipo: TipoConversazione = '1to1'): Promise<Conversazione> {
    try {
      // Verifica se esiste gia una conversazione 1to1 tra questi partecipanti
      if (tipo === '1to1') {
        const esistente = await this.findByPartecipanti(partecipanti);
        if (esistente) return esistente;
      }

      const conversazioneData = {
        partecipanti,
        tipo,
        ultimoMessaggio: null,
        ultimoMessaggioAt: null,
      };

      const docRef = await addDoc(collection(db, 'chat'), conversazioneData);
      return {
        id: docRef.id,
        ...conversazioneData,
        ultimoMessaggio: undefined,
        ultimoMessaggioAt: undefined,
      };
    } catch (error) {
      console.error('Errore create conversazione:', error);
      throw error;
    }
  },

  // Trova conversazione per partecipanti
  async findByPartecipanti(partecipanti: string[]): Promise<Conversazione | null> {
    try {
      // Per conversazioni 1to1, cerchiamo quella con esattamente questi partecipanti
      const q = query(
        collection(db, 'chat'),
        where('tipo', '==', '1to1'),
        where('partecipanti', 'array-contains', partecipanti[0])
      );
      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const docPartecipanti = data.partecipanti as string[];

        // Verifica che contenga entrambi i partecipanti
        if (
          docPartecipanti.length === partecipanti.length &&
          partecipanti.every(p => docPartecipanti.includes(p))
        ) {
          return {
            id: doc.id,
            partecipanti: docPartecipanti,
            tipo: data.tipo as TipoConversazione,
            ultimoMessaggio: data.ultimoMessaggio,
            ultimoMessaggioAt: data.ultimoMessaggioAt
              ? convertTimestamp(data.ultimoMessaggioAt)
              : undefined,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Errore findByPartecipanti:', error);
      throw error;
    }
  },

  // Ottieni conversazioni per utente
  async getByUser(userId: string): Promise<Conversazione[]> {
    try {
      const q = query(
        collection(db, 'chat'),
        where('partecipanti', 'array-contains', userId),
        orderBy('ultimoMessaggioAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          partecipanti: data.partecipanti,
          tipo: data.tipo as TipoConversazione,
          ultimoMessaggio: data.ultimoMessaggio,
          ultimoMessaggioAt: data.ultimoMessaggioAt
            ? convertTimestamp(data.ultimoMessaggioAt)
            : undefined,
        };
      });
    } catch (error) {
      console.error('Errore getByUser conversazioni:', error);
      throw error;
    }
  },

  // Ottieni conversazione per ID
  async getById(conversazioneId: string): Promise<Conversazione | null> {
    try {
      const docRef = await getDoc(doc(db, 'chat', conversazioneId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        partecipanti: data.partecipanti,
        tipo: data.tipo as TipoConversazione,
        ultimoMessaggio: data.ultimoMessaggio,
        ultimoMessaggioAt: data.ultimoMessaggioAt
          ? convertTimestamp(data.ultimoMessaggioAt)
          : undefined,
      };
    } catch (error) {
      console.error('Errore getById conversazione:', error);
      throw error;
    }
  },

  // Listener realtime per conversazioni utente
  subscribeToUserConversazioni(
    userId: string,
    callback: (conversazioni: Conversazione[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chat'),
      where('partecipanti', 'array-contains', userId),
      orderBy('ultimoMessaggioAt', 'desc')
    );

    return onSnapshot(q, snapshot => {
      const conversazioni = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          partecipanti: data.partecipanti,
          tipo: data.tipo as TipoConversazione,
          ultimoMessaggio: data.ultimoMessaggio,
          ultimoMessaggioAt: data.ultimoMessaggioAt
            ? convertTimestamp(data.ultimoMessaggioAt)
            : undefined,
        };
      });
      callback(conversazioni);
    });
  },
};

// ============================================
// SERVIZIO MESSAGGI
// ============================================

export const messaggiService = {
  // Invia messaggio
  async send(conversazioneId: string, mittente: string, testo: string, allegati?: string[]): Promise<Messaggio> {
    try {
      const messaggioData = {
        mittente,
        testo,
        allegati: allegati || [],
        letto: false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, 'chat', conversazioneId, 'messaggi'),
        messaggioData
      );

      // Aggiorna ultimo messaggio nella conversazione
      await updateDoc(doc(db, 'chat', conversazioneId), {
        ultimoMessaggio: testo.substring(0, 50),
        ultimoMessaggioAt: Timestamp.now(),
      });

      return {
        id: docRef.id,
        mittente,
        testo,
        allegati,
        letto: false,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Errore send messaggio:', error);
      throw error;
    }
  },

  // Ottieni messaggi di una conversazione
  async getByConversazione(conversazioneId: string, limitCount: number = 50): Promise<Messaggio[]> {
    try {
      const q = query(
        collection(db, 'chat', conversazioneId, 'messaggi'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            mittente: data.mittente,
            testo: data.testo,
            allegati: data.allegati,
            letto: data.letto,
            createdAt: convertTimestamp(data.createdAt),
          };
        })
        .reverse(); // Inverti per avere i piu vecchi prima
    } catch (error) {
      console.error('Errore getByConversazione messaggi:', error);
      throw error;
    }
  },

  // Segna messaggi come letti
  async segnaComeLetti(conversazioneId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'chat', conversazioneId, 'messaggi'),
        where('letto', '==', false),
        where('mittente', '!=', userId)
      );
      const snapshot = await getDocs(q);

      const promises = snapshot.docs.map(docSnap =>
        updateDoc(doc(db, 'chat', conversazioneId, 'messaggi', docSnap.id), {
          letto: true,
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Errore segnaComeLetti:', error);
      throw error;
    }
  },

  // Conta messaggi non letti
  async countNonLetti(conversazioneId: string, userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'chat', conversazioneId, 'messaggi'),
        where('letto', '==', false),
        where('mittente', '!=', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Errore countNonLetti:', error);
      throw error;
    }
  },

  // Listener realtime per messaggi
  subscribeToMessaggi(
    conversazioneId: string,
    callback: (messaggi: Messaggio[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chat', conversazioneId, 'messaggi'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, snapshot => {
      const messaggi = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          mittente: data.mittente,
          testo: data.testo,
          allegati: data.allegati,
          letto: data.letto,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
      callback(messaggi);
    });
  },

  // Totale messaggi non letti per utente (tutte le conversazioni)
  async getTotaleNonLetti(userId: string): Promise<number> {
    try {
      const conversazioni = await conversazioniService.getByUser(userId);
      let totale = 0;

      for (const conv of conversazioni) {
        const count = await this.countNonLetti(conv.id, userId);
        totale += count;
      }

      return totale;
    } catch (error) {
      console.error('Errore getTotaleNonLetti:', error);
      throw error;
    }
  },
};
