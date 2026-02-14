// App ESSĒRE - Test Posturale Service
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
import {
  TestPosturale,
  ImmaginePosturale,
  TipoImmaginePosturale,
  AnalisiAI,
  PuntoCorpo,
} from '../types';

// Crea un nuovo test posturale
export const creaTestPosturale = async (
  allievoId: string,
  collaboratoreId: string
): Promise<TestPosturale> => {
  if (!isConfigured) {
    return {
      id: `test_${Date.now()}`,
      allievoId,
      collaboratoreId,
      data: new Date(),
      immagini: [],
    };
  }

  const testRef = await addDoc(collection(db, COLLECTIONS.TEST_POSTURALI), {
    allievoId,
    collaboratoreId,
    data: serverTimestamp(),
    immagini: [],
    createdAt: serverTimestamp(),
  });

  return {
    id: testRef.id,
    allievoId,
    collaboratoreId,
    data: new Date(),
    immagini: [],
  };
};

// Aggiungi immagine al test
export const aggiungiImmagineTest = async (
  testId: string,
  uri: string,
  tipo: TipoImmaginePosturale
): Promise<ImmaginePosturale> => {
  let url = uri;

  if (isConfigured) {
    // Upload immagine
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(
      storage,
      `test-posturali/${testId}/${tipo}_${Date.now()}.jpg`
    );
    await uploadBytes(storageRef, blob);
    url = await getDownloadURL(storageRef);
  }

  const immagine: ImmaginePosturale = {
    url,
    tipo,
  };

  if (isConfigured) {
    const testRef = doc(db, COLLECTIONS.TEST_POSTURALI, testId);
    const testSnap = await getDoc(testRef);

    if (testSnap.exists()) {
      const immagini = testSnap.data().immagini || [];
      // Rimuovi immagine precedente dello stesso tipo se esiste
      const nuoveImmagini = immagini.filter(
        (img: ImmaginePosturale) => img.tipo !== tipo
      );
      nuoveImmagini.push(immagine);

      await updateDoc(testRef, { immagini: nuoveImmagini });
    }
  }

  return immagine;
};

// Analizza postura con AI (mock - in produzione userebbe TensorFlow.js o API esterna)
export const analizzaPostura = async (
  immagineUrl: string
): Promise<AnalisiAI> => {
  // Simulazione analisi AI
  // In produzione, questo chiamerebbe un servizio ML reale

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula elaborazione

  const puntiRilevati: PuntoCorpo[] = [
    { nome: 'spalla_sx', x: 0.3, y: 0.25, confidenza: 0.95 },
    { nome: 'spalla_dx', x: 0.7, y: 0.24, confidenza: 0.93 },
    { nome: 'anca_sx', x: 0.35, y: 0.55, confidenza: 0.91 },
    { nome: 'anca_dx', x: 0.65, y: 0.54, confidenza: 0.92 },
    { nome: 'ginocchio_sx', x: 0.32, y: 0.75, confidenza: 0.89 },
    { nome: 'ginocchio_dx', x: 0.68, y: 0.76, confidenza: 0.88 },
  ];

  // Calcola problemi basandosi sui punti (simulazione)
  const problemiRilevati: string[] = [];
  const suggerimenti: string[] = [];

  // Verifica asimmetria spalle
  const diffSpalle = Math.abs(
    (puntiRilevati[0]?.y || 0) - (puntiRilevati[1]?.y || 0)
  );
  if (diffSpalle > 0.02) {
    problemiRilevati.push('Leggera asimmetria delle spalle');
    suggerimenti.push(
      'Esercizi di stretching per il trapezio e rafforzamento unilaterale'
    );
  }

  // Verifica asimmetria anche
  const diffAnche = Math.abs(
    (puntiRilevati[2]?.y || 0) - (puntiRilevati[3]?.y || 0)
  );
  if (diffAnche > 0.02) {
    problemiRilevati.push('Possibile disallineamento del bacino');
    suggerimenti.push(
      'Valutare mobilità anche e stretching dei flessori dellanca'
    );
  }

  if (problemiRilevati.length === 0) {
    problemiRilevati.push('Postura complessivamente buona');
    suggerimenti.push('Mantenere routine di mobilità e stretching');
  }

  return {
    puntiRilevati,
    problemiRilevati,
    suggerimenti,
  };
};

// Completa test con analisi
export const completaTestPosturale = async (
  testId: string,
  noteManuali?: string
): Promise<TestPosturale> => {
  const test = await getTestPosturale(testId);
  if (!test) throw new Error('Test non trovato');

  // Analizza ogni immagine
  const immaginiAnalizzate: ImmaginePosturale[] = [];
  const tuttiProblemi: string[] = [];
  const tuttiSuggerimenti: string[] = [];

  for (const img of test.immagini) {
    const analisi = await analizzaPostura(img.url);
    immaginiAnalizzate.push({
      ...img,
      analisiAI: analisi,
    });
    tuttiProblemi.push(...analisi.problemiRilevati);
    tuttiSuggerimenti.push(...analisi.suggerimenti);
  }

  // Genera report
  const report = generaReport(tuttiProblemi, tuttiSuggerimenti);

  if (isConfigured) {
    await updateDoc(doc(db, COLLECTIONS.TEST_POSTURALI, testId), {
      immagini: immaginiAnalizzate,
      noteAutomatiche: report,
      noteManuali: noteManuali || '',
      report,
      completatoAt: serverTimestamp(),
    });
  }

  return {
    ...test,
    immagini: immaginiAnalizzate,
    noteAutomatiche: report,
    noteManuali,
    report,
  };
};

// Genera report testuale
const generaReport = (problemi: string[], suggerimenti: string[]): string => {
  const problemiUnici = [...new Set(problemi)];
  const suggerimentiUnici = [...new Set(suggerimenti)];

  let report = '## Analisi Posturale\n\n';

  report += '### Osservazioni\n';
  problemiUnici.forEach((p) => {
    report += `- ${p}\n`;
  });

  report += '\n### Raccomandazioni\n';
  suggerimentiUnici.forEach((s) => {
    report += `- ${s}\n`;
  });

  report +=
    '\n_Nota: Questa analisi è generata automaticamente e dovrebbe essere verificata da un professionista._';

  return report;
};

// Ottieni test per ID
export const getTestPosturale = async (
  testId: string
): Promise<TestPosturale | null> => {
  if (!isConfigured) {
    return {
      id: testId,
      allievoId: 'mock_allievo',
      collaboratoreId: 'mock_collab',
      data: new Date(),
      immagini: [],
      report: 'Test di esempio',
    };
  }

  const docRef = doc(db, COLLECTIONS.TEST_POSTURALI, testId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    allievoId: data.allievoId,
    collaboratoreId: data.collaboratoreId,
    data: data.data?.toDate() || new Date(),
    immagini: data.immagini || [],
    noteAutomatiche: data.noteAutomatiche,
    noteManuali: data.noteManuali,
    report: data.report,
  };
};

// Ottieni tutti i test di un allievo
export const getTestPosturaliAllievo = async (
  allievoId: string
): Promise<TestPosturale[]> => {
  if (!isConfigured) {
    return [
      {
        id: 'test_1',
        allievoId,
        collaboratoreId: 'collab_1',
        data: new Date(),
        immagini: [],
        report: 'Postura complessivamente buona. Leggera asimmetria delle spalle.',
      },
      {
        id: 'test_2',
        allievoId,
        collaboratoreId: 'collab_1',
        data: new Date(Date.now() - 30 * 86400000),
        immagini: [],
        report: 'Prima valutazione. Identificati alcuni punti di miglioramento.',
      },
    ];
  }

  const q = query(
    collection(db, COLLECTIONS.TEST_POSTURALI),
    where('allievoId', '==', allievoId),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      allievoId: data.allievoId,
      collaboratoreId: data.collaboratoreId,
      data: data.data?.toDate() || new Date(),
      immagini: data.immagini || [],
      noteAutomatiche: data.noteAutomatiche,
      noteManuali: data.noteManuali,
      report: data.report,
    };
  });
};

// Ottieni test per collaboratore
export const getTestPosturaliCollaboratore = async (
  collaboratoreId: string
): Promise<TestPosturale[]> => {
  if (!isConfigured) {
    return [];
  }

  const q = query(
    collection(db, COLLECTIONS.TEST_POSTURALI),
    where('collaboratoreId', '==', collaboratoreId),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      allievoId: data.allievoId,
      collaboratoreId: data.collaboratoreId,
      data: data.data?.toDate() || new Date(),
      immagini: data.immagini || [],
      noteAutomatiche: data.noteAutomatiche,
      noteManuali: data.noteManuali,
      report: data.report,
    };
  });
};

// Elimina test
export const eliminaTestPosturale = async (testId: string): Promise<void> => {
  if (!isConfigured) return;

  await deleteDoc(doc(db, COLLECTIONS.TEST_POSTURALI, testId));
};
