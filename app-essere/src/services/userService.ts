// App ESSĒRE - User Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { User, UserRole, Collaboratore, Allievo } from '../types';

// ============ USERS ============

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email,
      nome: data.nome,
      cognome: data.cognome,
      telefono: data.telefono,
      ruolo: data.ruolo,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }
  return null;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const getUsersByRole = async (ruolo: UserRole): Promise<User[]> => {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('ruolo', '==', ruolo),
    orderBy('nome')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      nome: data.nome,
      cognome: data.cognome,
      telefono: data.telefono,
      ruolo: data.ruolo,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  });
};

// ============ COLLABORATORI ============

export const getCollaboratore = async (userId: string): Promise<Collaboratore | null> => {
  const docRef = doc(db, COLLECTIONS.COLLABORATORI, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      percentuale: data.percentuale,
      specializzazioni: data.specializzazioni || [],
      allieviIds: data.allieviIds || [],
      attivo: data.attivo,
    };
  }
  return null;
};

export const getAllCollaboratori = async (): Promise<Collaboratore[]> => {
  const q = query(
    collection(db, COLLECTIONS.COLLABORATORI),
    where('attivo', '==', true)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
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
};

export const createCollaboratore = async (
  userId: string,
  data: Omit<Collaboratore, 'id'>
): Promise<void> => {
  await setDoc(doc(db, COLLECTIONS.COLLABORATORI, userId), data);
};

export const updateCollaboratore = async (
  userId: string,
  data: Partial<Collaboratore>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.COLLABORATORI, userId);
  await updateDoc(docRef, data);
};

export const updateCollaboratorePercentuale = async (
  userId: string,
  percentuale: number
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.COLLABORATORI, userId);
  await updateDoc(docRef, { percentuale });
};

// ============ ALLIEVI ============

export const getAllievo = async (userId: string): Promise<Allievo | null> => {
  const docRef = doc(db, COLLECTIONS.ALLIEVI, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      collaboratoreId: data.collaboratoreId,
      dataInizio: data.dataInizio?.toDate(),
      obiettivo: data.obiettivo,
      note: data.note,
      attivo: data.attivo,
    };
  }
  return null;
};

export const getAllAllievi = async (): Promise<Allievo[]> => {
  const q = query(
    collection(db, COLLECTIONS.ALLIEVI),
    where('attivo', '==', true)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      collaboratoreId: data.collaboratoreId,
      dataInizio: data.dataInizio?.toDate(),
      obiettivo: data.obiettivo,
      note: data.note,
      attivo: data.attivo,
    };
  });
};

export const getAllieviByCollaboratore = async (
  collaboratoreId: string
): Promise<Allievo[]> => {
  const q = query(
    collection(db, COLLECTIONS.ALLIEVI),
    where('collaboratoreId', '==', collaboratoreId),
    where('attivo', '==', true)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      collaboratoreId: data.collaboratoreId,
      dataInizio: data.dataInizio?.toDate(),
      obiettivo: data.obiettivo,
      note: data.note,
      attivo: data.attivo,
    };
  });
};

export const createAllievo = async (
  userId: string,
  data: Omit<Allievo, 'id'>
): Promise<void> => {
  await setDoc(doc(db, COLLECTIONS.ALLIEVI, userId), data);

  // Aggiorna la lista allievi del collaboratore
  if (data.collaboratoreId) {
    const collabRef = doc(db, COLLECTIONS.COLLABORATORI, data.collaboratoreId);
    const collabSnap = await getDoc(collabRef);
    if (collabSnap.exists()) {
      const collabData = collabSnap.data();
      const allieviIds = collabData.allieviIds || [];
      if (!allieviIds.includes(userId)) {
        await updateDoc(collabRef, {
          allieviIds: [...allieviIds, userId],
        });
      }
    }
  }
};

export const updateAllievo = async (
  userId: string,
  data: Partial<Allievo>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ALLIEVI, userId);
  await updateDoc(docRef, data);
};

export const assignAllievoToCollaboratore = async (
  allievoId: string,
  collaboratoreId: string
): Promise<void> => {
  // Aggiorna l'allievo
  await updateAllievo(allievoId, { collaboratoreId });

  // Aggiorna la lista del collaboratore
  const collabRef = doc(db, COLLECTIONS.COLLABORATORI, collaboratoreId);
  const collabSnap = await getDoc(collabRef);
  if (collabSnap.exists()) {
    const collabData = collabSnap.data();
    const allieviIds = collabData.allieviIds || [];
    if (!allieviIds.includes(allievoId)) {
      await updateDoc(collabRef, {
        allieviIds: [...allieviIds, allievoId],
      });
    }
  }
};

// Helper per ottenere user con dati ruolo
export interface UserWithRoleData extends User {
  roleData?: Collaboratore | Allievo;
}

export const getUserWithRoleData = async (
  userId: string
): Promise<UserWithRoleData | null> => {
  const user = await getUser(userId);
  if (!user) return null;

  let roleData: Collaboratore | Allievo | undefined;

  if (user.ruolo === 'collaboratore') {
    roleData = (await getCollaboratore(userId)) || undefined;
  } else if (user.ruolo === 'allievo') {
    roleData = (await getAllievo(userId)) || undefined;
  }

  return { ...user, roleData };
};
