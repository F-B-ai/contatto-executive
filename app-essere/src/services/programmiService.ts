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
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Programma, Esercizio, SessioneProgramma, EsercizioInProgramma } from '../types';

// ============================================
// SERVIZIO ESERCIZI
// ============================================

export const eserciziService = {
  // Crea esercizio
  async create(esercizioData: Omit<Esercizio, 'id'>): Promise<Esercizio> {
    try {
      const docRef = doc(collection(db, 'esercizi'));
      await setDoc(docRef, esercizioData);
      return { id: docRef.id, ...esercizioData };
    } catch (error) {
      console.error('Errore create esercizio:', error);
      throw error;
    }
  },

  // Ottieni esercizio per ID
  async getById(esercizioId: string): Promise<Esercizio | null> {
    try {
      const docRef = await getDoc(doc(db, 'esercizi', esercizioId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        nome: data.nome,
        descrizione: data.descrizione,
        categoria: data.categoria,
        videoUrl: data.videoUrl,
        immagineUrl: data.immagineUrl,
        istruzioni: data.istruzioni,
      };
    } catch (error) {
      console.error('Errore getById esercizio:', error);
      throw error;
    }
  },

  // Ottieni tutti gli esercizi
  async getAll(): Promise<Esercizio[]> {
    try {
      const q = query(collection(db, 'esercizi'), orderBy('nome'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
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
      });
    } catch (error) {
      console.error('Errore getAll esercizi:', error);
      throw error;
    }
  },

  // Ottieni esercizi per categoria
  async getByCategoria(categoria: string): Promise<Esercizio[]> {
    try {
      const q = query(
        collection(db, 'esercizi'),
        where('categoria', '==', categoria),
        orderBy('nome')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
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
      });
    } catch (error) {
      console.error('Errore getByCategoria esercizi:', error);
      throw error;
    }
  },

  // Aggiorna esercizio
  async update(esercizioId: string, updates: Partial<Esercizio>): Promise<void> {
    try {
      await updateDoc(doc(db, 'esercizi', esercizioId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Errore update esercizio:', error);
      throw error;
    }
  },

  // Elimina esercizio
  async delete(esercizioId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'esercizi', esercizioId));
    } catch (error) {
      console.error('Errore delete esercizio:', error);
      throw error;
    }
  },

  // Ottieni categorie uniche
  async getCategorie(): Promise<string[]> {
    try {
      const esercizi = await this.getAll();
      const categorie = new Set(esercizi.map(e => e.categoria));
      return Array.from(categorie).sort();
    } catch (error) {
      console.error('Errore getCategorie:', error);
      throw error;
    }
  },

  // Cerca esercizi
  async search(searchTerm: string): Promise<Esercizio[]> {
    try {
      // Firestore non supporta ricerca full-text, quindi carichiamo tutto e filtriamo
      const esercizi = await this.getAll();
      const term = searchTerm.toLowerCase();
      return esercizi.filter(
        e =>
          e.nome.toLowerCase().includes(term) ||
          e.descrizione?.toLowerCase().includes(term) ||
          e.categoria.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Errore search esercizi:', error);
      throw error;
    }
  },
};

// ============================================
// SERVIZIO PROGRAMMI
// ============================================

export const programmiService = {
  // Crea programma
  async create(programmaData: Omit<Programma, 'id'>): Promise<Programma> {
    try {
      const docRef = doc(collection(db, 'programmi'));
      await setDoc(docRef, programmaData);
      return { id: docRef.id, ...programmaData };
    } catch (error) {
      console.error('Errore create programma:', error);
      throw error;
    }
  },

  // Ottieni programma per ID
  async getById(programmaId: string): Promise<Programma | null> {
    try {
      const docRef = await getDoc(doc(db, 'programmi', programmaId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        nome: data.nome,
        descrizione: data.descrizione,
        durataSettimane: data.durataSettimane,
        creatoDa: data.creatoDa,
        sessioni: data.sessioni as SessioneProgramma[],
        assegnatoA: data.assegnatoA || [],
      };
    } catch (error) {
      console.error('Errore getById programma:', error);
      throw error;
    }
  },

  // Ottieni programmi creati da un utente
  async getByCreatore(userId: string): Promise<Programma[]> {
    try {
      const q = query(
        collection(db, 'programmi'),
        where('creatoDa', '==', userId),
        orderBy('nome')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          descrizione: data.descrizione,
          durataSettimane: data.durataSettimane,
          creatoDa: data.creatoDa,
          sessioni: data.sessioni as SessioneProgramma[],
          assegnatoA: data.assegnatoA || [],
        };
      });
    } catch (error) {
      console.error('Errore getByCreatore programmi:', error);
      throw error;
    }
  },

  // Ottieni programmi assegnati a un allievo
  async getByAllievo(allievoId: string): Promise<Programma[]> {
    try {
      const q = query(
        collection(db, 'programmi'),
        where('assegnatoA', 'array-contains', allievoId)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          descrizione: data.descrizione,
          durataSettimane: data.durataSettimane,
          creatoDa: data.creatoDa,
          sessioni: data.sessioni as SessioneProgramma[],
          assegnatoA: data.assegnatoA || [],
        };
      });
    } catch (error) {
      console.error('Errore getByAllievo programmi:', error);
      throw error;
    }
  },

  // Aggiorna programma
  async update(programmaId: string, updates: Partial<Programma>): Promise<void> {
    try {
      await updateDoc(doc(db, 'programmi', programmaId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Errore update programma:', error);
      throw error;
    }
  },

  // Elimina programma
  async delete(programmaId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'programmi', programmaId));
    } catch (error) {
      console.error('Errore delete programma:', error);
      throw error;
    }
  },

  // Assegna programma a allievo
  async assegnaAllievo(programmaId: string, allievoId: string): Promise<void> {
    try {
      const programma = await this.getById(programmaId);
      if (!programma) throw new Error('Programma non trovato');

      if (!programma.assegnatoA.includes(allievoId)) {
        const assegnatoA = [...programma.assegnatoA, allievoId];
        await this.update(programmaId, { assegnatoA });
      }
    } catch (error) {
      console.error('Errore assegnaAllievo:', error);
      throw error;
    }
  },

  // Rimuovi assegnazione allievo
  async rimuoviAllievo(programmaId: string, allievoId: string): Promise<void> {
    try {
      const programma = await this.getById(programmaId);
      if (!programma) throw new Error('Programma non trovato');

      const assegnatoA = programma.assegnatoA.filter(id => id !== allievoId);
      await this.update(programmaId, { assegnatoA });
    } catch (error) {
      console.error('Errore rimuoviAllievo:', error);
      throw error;
    }
  },

  // Duplica programma
  async duplica(programmaId: string, nuovoNome: string, nuovoCreatore: string): Promise<Programma> {
    try {
      const originale = await this.getById(programmaId);
      if (!originale) throw new Error('Programma non trovato');

      const nuovoProgramma: Omit<Programma, 'id'> = {
        nome: nuovoNome,
        descrizione: originale.descrizione,
        durataSettimane: originale.durataSettimane,
        creatoDa: nuovoCreatore,
        sessioni: originale.sessioni,
        assegnatoA: [],
      };

      return await this.create(nuovoProgramma);
    } catch (error) {
      console.error('Errore duplica programma:', error);
      throw error;
    }
  },

  // Ottieni tutti i programmi
  async getAll(): Promise<Programma[]> {
    try {
      const q = query(collection(db, 'programmi'), orderBy('nome'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          descrizione: data.descrizione,
          durataSettimane: data.durataSettimane,
          creatoDa: data.creatoDa,
          sessioni: data.sessioni as SessioneProgramma[],
          assegnatoA: data.assegnatoA || [],
        };
      });
    } catch (error) {
      console.error('Errore getAll programmi:', error);
      throw error;
    }
  },

  // Helper: crea sessione programma vuota
  createEmptySessione(giorno: number): SessioneProgramma {
    return {
      giorno,
      esercizi: [],
    };
  },

  // Helper: crea esercizio in programma
  createEsercizioInProgramma(
    esercizioId: string,
    serie: number,
    ripetizioni: string,
    recupero: number,
    note?: string
  ): EsercizioInProgramma {
    return {
      esercizioId,
      serie,
      ripetizioni,
      recupero,
      note,
    };
  },
};
