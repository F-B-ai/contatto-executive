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
import { db } from './firebase';
import { Pagamento, Rata, ModalitaPagamento, Spesa, Ricavo } from '../types';

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
        if (typeof item === 'object' && item !== null) {
          return toFirestoreData(item as Record<string, unknown>);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = toFirestoreData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const rateFromFirestore = (rate: unknown[]): Rata[] => {
  return rate.map((r: unknown) => {
    const rata = r as Record<string, unknown>;
    return {
      numero: rata.numero as number,
      importo: rata.importo as number,
      scadenza: convertTimestamp(rata.scadenza as Timestamp),
      pagata: rata.pagata as boolean,
      dataPagamento: rata.dataPagamento ? convertTimestamp(rata.dataPagamento as Timestamp) : undefined,
    };
  });
};

// ============================================
// SERVIZIO PAGAMENTI
// ============================================

export const pagamentiService = {
  // Crea nuovo pagamento
  async create(pagamentoData: Omit<Pagamento, 'id'>): Promise<Pagamento> {
    try {
      const docRef = doc(collection(db, 'pagamenti'));
      await setDoc(docRef, toFirestoreData(pagamentoData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...pagamentoData };
    } catch (error) {
      console.error('Errore create pagamento:', error);
      throw error;
    }
  },

  // Ottieni pagamento per ID
  async getById(pagamentoId: string): Promise<Pagamento | null> {
    try {
      const docRef = await getDoc(doc(db, 'pagamenti', pagamentoId));
      if (!docRef.exists()) return null;

      const data = docRef.data();
      return {
        id: docRef.id,
        allievoId: data.allievoId,
        collaboratoreId: data.collaboratoreId,
        importoTotale: data.importoTotale,
        modalita: data.modalita as ModalitaPagamento,
        rate: rateFromFirestore(data.rate),
        percentualeCollaboratore: data.percentualeCollaboratore,
        guadagnoCollaboratore: data.guadagnoCollaboratore,
        quotaTitolare: data.quotaTitolare,
        createdAt: convertTimestamp(data.createdAt),
      };
    } catch (error) {
      console.error('Errore getById pagamento:', error);
      throw error;
    }
  },

  // Aggiorna pagamento
  async update(pagamentoId: string, updates: Partial<Pagamento>): Promise<void> {
    try {
      await updateDoc(doc(db, 'pagamenti', pagamentoId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update pagamento:', error);
      throw error;
    }
  },

  // Ottieni pagamenti per allievo
  async getByAllievo(allievoId: string): Promise<Pagamento[]> {
    try {
      const q = query(
        collection(db, 'pagamenti'),
        where('allievoId', '==', allievoId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          importoTotale: data.importoTotale,
          modalita: data.modalita as ModalitaPagamento,
          rate: rateFromFirestore(data.rate),
          percentualeCollaboratore: data.percentualeCollaboratore,
          guadagnoCollaboratore: data.guadagnoCollaboratore,
          quotaTitolare: data.quotaTitolare,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getByAllievo pagamenti:', error);
      throw error;
    }
  },

  // Ottieni pagamenti per collaboratore
  async getByCollaboratore(collaboratoreId: string): Promise<Pagamento[]> {
    try {
      const q = query(
        collection(db, 'pagamenti'),
        where('collaboratoreId', '==', collaboratoreId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          importoTotale: data.importoTotale,
          modalita: data.modalita as ModalitaPagamento,
          rate: rateFromFirestore(data.rate),
          percentualeCollaboratore: data.percentualeCollaboratore,
          guadagnoCollaboratore: data.guadagnoCollaboratore,
          quotaTitolare: data.quotaTitolare,
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (error) {
      console.error('Errore getByCollaboratore pagamenti:', error);
      throw error;
    }
  },

  // Segna rata come pagata
  async segnaRataPagata(pagamentoId: string, numeroRata: number): Promise<void> {
    try {
      const pagamento = await this.getById(pagamentoId);
      if (!pagamento) throw new Error('Pagamento non trovato');

      const rateAggiornate = pagamento.rate.map(r => {
        if (r.numero === numeroRata) {
          return { ...r, pagata: true, dataPagamento: new Date() };
        }
        return r;
      });

      await this.update(pagamentoId, { rate: rateAggiornate });
    } catch (error) {
      console.error('Errore segnaRataPagata:', error);
      throw error;
    }
  },

  // Ottieni rate in scadenza
  async getRateInScadenza(giorni: number = 7): Promise<{ pagamento: Pagamento; rata: Rata }[]> {
    try {
      const oggi = new Date();
      const scadenza = new Date();
      scadenza.setDate(scadenza.getDate() + giorni);

      const q = query(collection(db, 'pagamenti'));
      const snapshot = await getDocs(q);

      const rateInScadenza: { pagamento: Pagamento; rata: Rata }[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const pagamento: Pagamento = {
          id: doc.id,
          allievoId: data.allievoId,
          collaboratoreId: data.collaboratoreId,
          importoTotale: data.importoTotale,
          modalita: data.modalita as ModalitaPagamento,
          rate: rateFromFirestore(data.rate),
          percentualeCollaboratore: data.percentualeCollaboratore,
          guadagnoCollaboratore: data.guadagnoCollaboratore,
          quotaTitolare: data.quotaTitolare,
          createdAt: convertTimestamp(data.createdAt),
        };

        pagamento.rate.forEach(rata => {
          if (!rata.pagata && rata.scadenza >= oggi && rata.scadenza <= scadenza) {
            rateInScadenza.push({ pagamento, rata });
          }
        });
      });

      return rateInScadenza.sort((a, b) => a.rata.scadenza.getTime() - b.rata.scadenza.getTime());
    } catch (error) {
      console.error('Errore getRateInScadenza:', error);
      throw error;
    }
  },

  // Calcola guadagni collaboratore
  calcolaGuadagni(importoTotale: number, percentuale: number): { guadagnoCollaboratore: number; quotaTitolare: number } {
    const guadagnoCollaboratore = (importoTotale * percentuale) / 100;
    const quotaTitolare = importoTotale - guadagnoCollaboratore;
    return { guadagnoCollaboratore, quotaTitolare };
  },

  // Crea piano rate
  creaPianoRate(importoTotale: number, numeroRate: number, dataInizio: Date): Rata[] {
    const importoRata = importoTotale / numeroRate;
    const rate: Rata[] = [];

    for (let i = 0; i < numeroRate; i++) {
      const scadenza = new Date(dataInizio);
      scadenza.setMonth(scadenza.getMonth() + i);

      rate.push({
        numero: i + 1,
        importo: Math.round(importoRata * 100) / 100,
        scadenza,
        pagata: false,
      });
    }

    return rate;
  },
};

// ============================================
// SERVIZIO SPESE
// ============================================

export const speseService = {
  // Crea spesa
  async create(spesaData: Omit<Spesa, 'id'>): Promise<Spesa> {
    try {
      const docRef = doc(collection(db, 'spese'));
      await setDoc(docRef, toFirestoreData(spesaData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...spesaData };
    } catch (error) {
      console.error('Errore create spesa:', error);
      throw error;
    }
  },

  // Ottieni spese per periodo
  async getByPeriodo(startDate: Date, endDate: Date): Promise<Spesa[]> {
    try {
      const q = query(
        collection(db, 'spese'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate)),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          descrizione: data.descrizione,
          importo: data.importo,
          categoria: data.categoria,
          data: convertTimestamp(data.data),
          ricorrente: data.ricorrente,
        };
      });
    } catch (error) {
      console.error('Errore getByPeriodo spese:', error);
      throw error;
    }
  },

  // Aggiorna spesa
  async update(spesaId: string, updates: Partial<Spesa>): Promise<void> {
    try {
      await updateDoc(doc(db, 'spese', spesaId), toFirestoreData(updates as Record<string, unknown>));
    } catch (error) {
      console.error('Errore update spesa:', error);
      throw error;
    }
  },

  // Elimina spesa
  async delete(spesaId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'spese', spesaId));
    } catch (error) {
      console.error('Errore delete spesa:', error);
      throw error;
    }
  },

  // Totale spese per periodo
  async getTotaleByPeriodo(startDate: Date, endDate: Date): Promise<number> {
    const spese = await this.getByPeriodo(startDate, endDate);
    return spese.reduce((acc, spesa) => acc + spesa.importo, 0);
  },
};

// ============================================
// SERVIZIO RICAVI
// ============================================

export const ricaviService = {
  // Crea ricavo
  async create(ricavoData: Omit<Ricavo, 'id'>): Promise<Ricavo> {
    try {
      const docRef = doc(collection(db, 'ricavi'));
      await setDoc(docRef, toFirestoreData(ricavoData as unknown as Record<string, unknown>));
      return { id: docRef.id, ...ricavoData };
    } catch (error) {
      console.error('Errore create ricavo:', error);
      throw error;
    }
  },

  // Ottieni ricavi per periodo
  async getByPeriodo(startDate: Date, endDate: Date): Promise<Ricavo[]> {
    try {
      const q = query(
        collection(db, 'ricavi'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate)),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          descrizione: data.descrizione,
          importo: data.importo,
          categoria: data.categoria,
          data: convertTimestamp(data.data),
          pagamentoId: data.pagamentoId,
        };
      });
    } catch (error) {
      console.error('Errore getByPeriodo ricavi:', error);
      throw error;
    }
  },

  // Totale ricavi per periodo
  async getTotaleByPeriodo(startDate: Date, endDate: Date): Promise<number> {
    const ricavi = await this.getByPeriodo(startDate, endDate);
    return ricavi.reduce((acc, ricavo) => acc + ricavo.importo, 0);
  },
};
