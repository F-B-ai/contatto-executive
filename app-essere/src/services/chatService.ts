// App ESSĒRE - Chat Service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db, COLLECTIONS, isConfigured } from './firebase';
import { Conversazione, Messaggio, Allegato, TipoChat } from '../types';

// Crea una nuova conversazione 1-to-1
export const creaConversazione = async (
  partecipanti: string[],
  tipo: TipoChat = '1to1'
): Promise<Conversazione> => {
  if (!isConfigured) {
    // Mock per testing
    return {
      id: `conv_${Date.now()}`,
      partecipanti,
      tipo,
      ultimoMessaggio: undefined,
      ultimoMessaggioAt: undefined,
    };
  }

  // Verifica se esiste già una conversazione tra questi partecipanti (per 1to1)
  if (tipo === '1to1') {
    const esistente = await getConversazioneByPartecipanti(partecipanti);
    if (esistente) return esistente;
  }

  const conversazioneRef = await addDoc(collection(db, COLLECTIONS.CHAT), {
    partecipanti,
    tipo,
    createdAt: serverTimestamp(),
  });

  return {
    id: conversazioneRef.id,
    partecipanti,
    tipo,
  };
};

// Trova conversazione esistente tra partecipanti
export const getConversazioneByPartecipanti = async (
  partecipanti: string[]
): Promise<Conversazione | null> => {
  if (!isConfigured) return null;

  const q = query(
    collection(db, COLLECTIONS.CHAT),
    where('tipo', '==', '1to1'),
    where('partecipanti', 'array-contains', partecipanti[0])
  );

  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const hasAllPartecipanti = partecipanti.every((p) =>
      data.partecipanti.includes(p)
    );
    if (hasAllPartecipanti && data.partecipanti.length === partecipanti.length) {
      return {
        id: doc.id,
        partecipanti: data.partecipanti,
        tipo: data.tipo,
        ultimoMessaggio: data.ultimoMessaggio,
        ultimoMessaggioAt: data.ultimoMessaggioAt?.toDate(),
      };
    }
  }

  return null;
};

// Ottieni conversazione per ID
export const getConversazione = async (
  conversazioneId: string
): Promise<Conversazione | null> => {
  if (!isConfigured) return null;

  const docRef = doc(db, COLLECTIONS.CHAT, conversazioneId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    partecipanti: data.partecipanti,
    tipo: data.tipo,
    ultimoMessaggio: data.ultimoMessaggio,
    ultimoMessaggioAt: data.ultimoMessaggioAt?.toDate(),
  };
};

// Ottieni tutte le conversazioni di un utente
export const getConversazioniUtente = async (
  userId: string
): Promise<Conversazione[]> => {
  if (!isConfigured) {
    // Mock per testing
    return [
      {
        id: 'conv_1',
        partecipanti: [userId, 'user_2'],
        tipo: '1to1',
        ultimoMessaggio: 'Ciao, come stai?',
        ultimoMessaggioAt: new Date(),
      },
      {
        id: 'conv_2',
        partecipanti: [userId, 'user_3'],
        tipo: '1to1',
        ultimoMessaggio: 'A domani!',
        ultimoMessaggioAt: new Date(Date.now() - 86400000),
      },
    ];
  }

  const q = query(
    collection(db, COLLECTIONS.CHAT),
    where('partecipanti', 'array-contains', userId),
    orderBy('ultimoMessaggioAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      partecipanti: data.partecipanti,
      tipo: data.tipo,
      ultimoMessaggio: data.ultimoMessaggio,
      ultimoMessaggioAt: data.ultimoMessaggioAt?.toDate(),
    };
  });
};

// Invia un messaggio
export const inviaMessaggio = async (
  conversazioneId: string,
  mittente: string,
  testo: string,
  allegati?: Allegato[]
): Promise<Messaggio> => {
  if (!isConfigured) {
    // Mock per testing
    return {
      id: `msg_${Date.now()}`,
      conversazioneId,
      mittente,
      testo,
      allegati,
      letto: false,
      createdAt: new Date(),
    };
  }

  const messaggioRef = await addDoc(
    collection(db, COLLECTIONS.CHAT, conversazioneId, 'messaggi'),
    {
      mittente,
      testo,
      allegati: allegati || [],
      letto: false,
      createdAt: serverTimestamp(),
    }
  );

  // Aggiorna l'ultimo messaggio nella conversazione
  await updateDoc(doc(db, COLLECTIONS.CHAT, conversazioneId), {
    ultimoMessaggio: testo,
    ultimoMessaggioAt: serverTimestamp(),
  });

  return {
    id: messaggioRef.id,
    conversazioneId,
    mittente,
    testo,
    allegati,
    letto: false,
    createdAt: new Date(),
  };
};

// Ottieni messaggi di una conversazione
export const getMessaggi = async (
  conversazioneId: string,
  limitCount: number = 50
): Promise<Messaggio[]> => {
  if (!isConfigured) {
    // Mock per testing
    return [
      {
        id: 'msg_1',
        conversazioneId,
        mittente: 'user_1',
        testo: 'Ciao!',
        letto: true,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: 'msg_2',
        conversazioneId,
        mittente: 'user_2',
        testo: 'Ciao, come stai?',
        letto: true,
        createdAt: new Date(Date.now() - 3500000),
      },
      {
        id: 'msg_3',
        conversazioneId,
        mittente: 'user_1',
        testo: 'Bene grazie, tu?',
        letto: false,
        createdAt: new Date(),
      },
    ];
  }

  const q = query(
    collection(db, COLLECTIONS.CHAT, conversazioneId, 'messaggi'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      conversazioneId,
      mittente: data.mittente,
      testo: data.testo,
      allegati: data.allegati,
      letto: data.letto,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

// Sottoscrivi ai messaggi in tempo reale
export const subscribeToMessaggi = (
  conversazioneId: string,
  callback: (messaggi: Messaggio[]) => void
): (() => void) => {
  if (!isConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTIONS.CHAT, conversazioneId, 'messaggi'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messaggi = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        conversazioneId,
        mittente: data.mittente,
        testo: data.testo,
        allegati: data.allegati,
        letto: data.letto,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
    callback(messaggi);
  });
};

// Segna messaggi come letti
export const segnaMessaggiLetti = async (
  conversazioneId: string,
  userId: string
): Promise<void> => {
  if (!isConfigured) return;

  const q = query(
    collection(db, COLLECTIONS.CHAT, conversazioneId, 'messaggi'),
    where('mittente', '!=', userId),
    where('letto', '==', false)
  );

  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((docSnap) =>
    updateDoc(doc(db, COLLECTIONS.CHAT, conversazioneId, 'messaggi', docSnap.id), {
      letto: true,
    })
  );

  await Promise.all(updates);
};

// Conta messaggi non letti
export const contaMessaggiNonLetti = async (
  userId: string
): Promise<number> => {
  if (!isConfigured) return 3; // Mock

  const conversazioni = await getConversazioniUtente(userId);
  let count = 0;

  for (const conv of conversazioni) {
    const q = query(
      collection(db, COLLECTIONS.CHAT, conv.id, 'messaggi'),
      where('mittente', '!=', userId),
      where('letto', '==', false)
    );

    const snapshot = await getDocs(q);
    count += snapshot.size;
  }

  return count;
};
