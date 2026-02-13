// App ESSĒRE - Payment Service
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
import { Pagamento, Rata, ModalitaPagamento, Spesa, Ricavo, CategoriaSpesa } from '../types';

// ============ HELPERS ============

const docToPagamento = (doc: any): Pagamento => {
  const data = doc.data();
  return {
    id: doc.id,
    allievoId: data.allievoId,
    collaboratoreId: data.collaboratoreId,
    descrizione: data.descrizione,
    importoTotale: data.importoTotale,
    modalita: data.modalita,
    rate: (data.rate || []).map((r: any) => ({
      ...r,
      scadenza: r.scadenza?.toDate(),
      dataPagamento: r.dataPagamento?.toDate(),
    })),
    percentualeCollaboratore: data.percentualeCollaboratore,
    guadagnoCollaboratore: data.guadagnoCollaboratore,
    quotaTitolare: data.quotaTitolare,
    createdAt: data.createdAt?.toDate(),
  };
};

const docToSpesa = (doc: any): Spesa => {
  const data = doc.data();
  return {
    id: doc.id,
    descrizione: data.descrizione,
    importo: data.importo,
    categoria: data.categoria,
    data: data.data?.toDate(),
    ricorrente: data.ricorrente,
  };
};

const docToRicavo = (doc: any): Ricavo => {
  const data = doc.data();
  return {
    id: doc.id,
    descrizione: data.descrizione,
    importo: data.importo,
    categoria: data.categoria,
    data: data.data?.toDate(),
    pagamentoId: data.pagamentoId,
  };
};

// ============ PAGAMENTI ============

export const getPagamento = async (pagamentoId: string): Promise<Pagamento | null> => {
  const docRef = doc(db, COLLECTIONS.PAGAMENTI, pagamentoId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToPagamento(docSnap);
  }
  return null;
};

export const getAllPagamenti = async (): Promise<Pagamento[]> => {
  const q = query(collection(db, COLLECTIONS.PAGAMENTI), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToPagamento);
};

export const getPagamentiByAllievo = async (allievoId: string): Promise<Pagamento[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAGAMENTI),
    where('allievoId', '==', allievoId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToPagamento);
};

export const getPagamentiByCollaboratore = async (collaboratoreId: string): Promise<Pagamento[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAGAMENTI),
    where('collaboratoreId', '==', collaboratoreId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToPagamento);
};

// Calcola automaticamente guadagni
export const calcolaGuadagni = (
  importoTotale: number,
  percentualeCollaboratore: number
): { guadagnoCollaboratore: number; quotaTitolare: number } => {
  const guadagnoCollaboratore = Math.round((importoTotale * percentualeCollaboratore) / 100 * 100) / 100;
  const quotaTitolare = Math.round((importoTotale - guadagnoCollaboratore) * 100) / 100;
  return { guadagnoCollaboratore, quotaTitolare };
};

// Crea nuovo pagamento
export const createPagamento = async (
  data: Omit<Pagamento, 'id' | 'createdAt' | 'guadagnoCollaboratore' | 'quotaTitolare'>
): Promise<string> => {
  const { guadagnoCollaboratore, quotaTitolare } = calcolaGuadagni(
    data.importoTotale,
    data.percentualeCollaboratore
  );

  // Converti date nelle rate
  const rateWithTimestamps = data.rate.map((r) => ({
    ...r,
    scadenza: Timestamp.fromDate(r.scadenza),
    dataPagamento: r.dataPagamento ? Timestamp.fromDate(r.dataPagamento) : null,
  }));

  const docRef = await addDoc(collection(db, COLLECTIONS.PAGAMENTI), {
    ...data,
    rate: rateWithTimestamps,
    guadagnoCollaboratore,
    quotaTitolare,
    createdAt: new Date(),
  });

  return docRef.id;
};

// Genera rate automaticamente
export const generaRate = (
  importoTotale: number,
  numeroRate: number,
  dataInizio: Date
): Rata[] => {
  const importoRata = Math.round((importoTotale / numeroRate) * 100) / 100;
  const rate: Rata[] = [];

  for (let i = 0; i < numeroRate; i++) {
    const scadenza = new Date(dataInizio);
    scadenza.setMonth(scadenza.getMonth() + i);

    rate.push({
      numero: i + 1,
      importo: i === numeroRate - 1
        ? Math.round((importoTotale - importoRata * (numeroRate - 1)) * 100) / 100 // Ultima rata aggiusta arrotondamenti
        : importoRata,
      scadenza,
      pagata: false,
    });
  }

  return rate;
};

// Segna rata come pagata
export const pagaRata = async (
  pagamentoId: string,
  numeroRata: number
): Promise<void> => {
  const pagamento = await getPagamento(pagamentoId);
  if (!pagamento) throw new Error('Pagamento non trovato');

  const nuoveRate = pagamento.rate.map((r) =>
    r.numero === numeroRata
      ? { ...r, pagata: true, dataPagamento: new Date() }
      : r
  );

  // Converti date per Firestore
  const rateWithTimestamps = nuoveRate.map((r) => ({
    ...r,
    scadenza: Timestamp.fromDate(r.scadenza),
    dataPagamento: r.dataPagamento ? Timestamp.fromDate(r.dataPagamento) : null,
  }));

  const docRef = doc(db, COLLECTIONS.PAGAMENTI, pagamentoId);
  await updateDoc(docRef, { rate: rateWithTimestamps });

  // Crea un ricavo per la rata pagata
  const rataPagata = nuoveRate.find((r) => r.numero === numeroRata);
  if (rataPagata) {
    await createRicavo({
      descrizione: `Rata ${numeroRata} - ${pagamento.descrizione}`,
      importo: rataPagata.importo,
      categoria: 'pagamento_allievo',
      data: new Date(),
      pagamentoId,
    });
  }
};

// Ottieni rate in scadenza
export const getRateInScadenza = async (giorniAvanti: number = 7): Promise<{
  pagamento: Pagamento;
  rata: Rata;
}[]> => {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const limite = new Date(oggi);
  limite.setDate(limite.getDate() + giorniAvanti);

  const pagamenti = await getAllPagamenti();
  const rateInScadenza: { pagamento: Pagamento; rata: Rata }[] = [];

  pagamenti.forEach((pagamento) => {
    pagamento.rate.forEach((rata) => {
      if (!rata.pagata && rata.scadenza >= oggi && rata.scadenza <= limite) {
        rateInScadenza.push({ pagamento, rata });
      }
    });
  });

  // Ordina per scadenza
  return rateInScadenza.sort((a, b) => a.rata.scadenza.getTime() - b.rata.scadenza.getTime());
};

// Ottieni rate scadute
export const getRateScadute = async (): Promise<{
  pagamento: Pagamento;
  rata: Rata;
}[]> => {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const pagamenti = await getAllPagamenti();
  const rateScadute: { pagamento: Pagamento; rata: Rata }[] = [];

  pagamenti.forEach((pagamento) => {
    pagamento.rate.forEach((rata) => {
      if (!rata.pagata && rata.scadenza < oggi) {
        rateScadute.push({ pagamento, rata });
      }
    });
  });

  return rateScadute.sort((a, b) => a.rata.scadenza.getTime() - b.rata.scadenza.getTime());
};

// ============ SPESE ============

export const getAllSpese = async (): Promise<Spesa[]> => {
  const q = query(collection(db, COLLECTIONS.SPESE), orderBy('data', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToSpesa);
};

export const getSpeseByPeriodo = async (startDate: Date, endDate: Date): Promise<Spesa[]> => {
  const q = query(
    collection(db, COLLECTIONS.SPESE),
    where('data', '>=', Timestamp.fromDate(startDate)),
    where('data', '<=', Timestamp.fromDate(endDate)),
    orderBy('data', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToSpesa);
};

export const createSpesa = async (data: Omit<Spesa, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.SPESE), {
    ...data,
    data: Timestamp.fromDate(data.data),
  });
  return docRef.id;
};

export const updateSpesa = async (spesaId: string, data: Partial<Spesa>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SPESE, spesaId);
  const updateData: any = { ...data };
  if (data.data) {
    updateData.data = Timestamp.fromDate(data.data);
  }
  await updateDoc(docRef, updateData);
};

export const deleteSpesa = async (spesaId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SPESE, spesaId);
  await deleteDoc(docRef);
};

// ============ RICAVI ============

export const getAllRicavi = async (): Promise<Ricavo[]> => {
  const q = query(collection(db, COLLECTIONS.RICAVI), orderBy('data', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToRicavo);
};

export const getRicaviByPeriodo = async (startDate: Date, endDate: Date): Promise<Ricavo[]> => {
  const q = query(
    collection(db, COLLECTIONS.RICAVI),
    where('data', '>=', Timestamp.fromDate(startDate)),
    where('data', '<=', Timestamp.fromDate(endDate)),
    orderBy('data', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToRicavo);
};

export const createRicavo = async (data: Omit<Ricavo, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.RICAVI), {
    ...data,
    data: Timestamp.fromDate(data.data),
  });
  return docRef.id;
};

// ============ STATISTICHE ECONOMICHE ============

export interface StatisticheEconomiche {
  // Totali
  entrateTotal: number;
  usciteTotali: number;
  profitto: number;

  // Dettagli entrate
  entrateDaAllievi: number;
  altreEntrate: number;

  // Dettagli uscite per categoria
  uscitePerCategoria: Record<CategoriaSpesa, number>;

  // Guadagni collaboratori
  guadagniCollaboratori: number;
  quotaTitolare: number;

  // Rate
  ratePagate: number;
  rateInAttesa: number;
  rateScadute: number;
}

export const getStatisticheEconomiche = async (
  startDate: Date,
  endDate: Date
): Promise<StatisticheEconomiche> => {
  const [spese, ricavi, pagamenti] = await Promise.all([
    getSpeseByPeriodo(startDate, endDate),
    getRicaviByPeriodo(startDate, endDate),
    getAllPagamenti(),
  ]);

  // Filtra pagamenti nel periodo
  const pagamentiPeriodo = pagamenti.filter(
    (p) => p.createdAt >= startDate && p.createdAt <= endDate
  );

  // Calcola entrate
  const entrateTotal = ricavi.reduce((sum, r) => sum + r.importo, 0);
  const entrateDaAllievi = ricavi
    .filter((r) => r.pagamentoId)
    .reduce((sum, r) => sum + r.importo, 0);
  const altreEntrate = entrateTotal - entrateDaAllievi;

  // Calcola uscite
  const usciteTotali = spese.reduce((sum, s) => sum + s.importo, 0);

  // Uscite per categoria
  const uscitePerCategoria: Record<CategoriaSpesa, number> = {
    affitto: 0,
    attrezzature: 0,
    marketing: 0,
    utenze: 0,
    personale: 0,
    altro: 0,
  };
  spese.forEach((s) => {
    uscitePerCategoria[s.categoria] += s.importo;
  });

  // Guadagni
  const guadagniCollaboratori = pagamentiPeriodo.reduce(
    (sum, p) => sum + p.guadagnoCollaboratore,
    0
  );
  const quotaTitolare = pagamentiPeriodo.reduce((sum, p) => sum + p.quotaTitolare, 0);

  // Rate
  let ratePagate = 0;
  let rateInAttesa = 0;
  let rateScadute = 0;
  const oggi = new Date();

  pagamenti.forEach((p) => {
    p.rate.forEach((r) => {
      if (r.pagata) {
        ratePagate++;
      } else if (r.scadenza < oggi) {
        rateScadute++;
      } else {
        rateInAttesa++;
      }
    });
  });

  return {
    entrateTotal,
    usciteTotali,
    profitto: entrateTotal - usciteTotali,
    entrateDaAllievi,
    altreEntrate,
    uscitePerCategoria,
    guadagniCollaboratori,
    quotaTitolare,
    ratePagate,
    rateInAttesa,
    rateScadute,
  };
};

// Statistiche per collaboratore
export const getStatisticheCollaboratore = async (
  collaboratoreId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  guadagnoTotale: number;
  sessioni: number;
  pagamentiGestiti: number;
}> => {
  const pagamenti = await getPagamentiByCollaboratore(collaboratoreId);

  // Filtra per periodo
  const pagamentiPeriodo = pagamenti.filter(
    (p) => p.createdAt >= startDate && p.createdAt <= endDate
  );

  const guadagnoTotale = pagamentiPeriodo.reduce(
    (sum, p) => {
      // Somma solo le rate pagate nel periodo
      const ratePagatePeriodo = p.rate.filter(
        (r) => r.pagata && r.dataPagamento && r.dataPagamento >= startDate && r.dataPagamento <= endDate
      );
      const importoPagato = ratePagatePeriodo.reduce((s, r) => s + r.importo, 0);
      return sum + (importoPagato * p.percentualeCollaboratore) / 100;
    },
    0
  );

  return {
    guadagnoTotale: Math.round(guadagnoTotale * 100) / 100,
    sessioni: 0, // Da implementare con sessionService
    pagamentiGestiti: pagamentiPeriodo.length,
  };
};

// Categorie spese disponibili
export const CATEGORIE_SPESA: { value: CategoriaSpesa; label: string }[] = [
  { value: 'affitto', label: 'Affitto' },
  { value: 'attrezzature', label: 'Attrezzature' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'utenze', label: 'Utenze' },
  { value: 'personale', label: 'Personale' },
  { value: 'altro', label: 'Altro' },
];
