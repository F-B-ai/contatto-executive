// App ESSĒRE - Auth Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS, isConfigured } from '../services/firebase';
import { User, UserRole, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: data.email,
          nome: data.nome,
          cognome: data.cognome,
          telefono: data.telefono,
          ruolo: data.ruolo,
          avatarUrl: data.avatarUrl,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Errore fetch user data:', error);
      return null;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    if (!isConfigured) {
      throw new Error('Firebase non configurato');
    }
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user);
      setUser(userData);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(getAuthErrorMessage(error.code));
    }
    setIsLoading(false);
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (!isConfigured) {
      throw new Error('Firebase non configurato');
    }
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const now = new Date();

      // Create user document in Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
        email: userData.email,
        nome: userData.nome,
        cognome: userData.cognome,
        telefono: userData.telefono || null,
        ruolo: userData.ruolo,
        avatarUrl: userData.avatarUrl || null,
        createdAt: now,
        updatedAt: now,
      });

      // If collaboratore, create collaboratore document
      if (userData.ruolo === 'collaboratore') {
        await setDoc(doc(db, COLLECTIONS.COLLABORATORI, result.user.uid), {
          userId: result.user.uid,
          percentuale: 50, // Default 50%
          specializzazioni: [],
          allieviIds: [],
          attivo: true,
        });
      }

      // If allievo, create allievo document (need collaboratoreId)
      if (userData.ruolo === 'allievo') {
        await setDoc(doc(db, COLLECTIONS.ALLIEVI, result.user.uid), {
          userId: result.user.uid,
          collaboratoreId: '', // Da assegnare dopo
          dataInizio: now,
          obiettivo: '',
          note: '',
          attivo: true,
        });
      }

      const newUser: User = {
        id: result.user.uid,
        ...userData,
        createdAt: now,
        updatedAt: now,
      };
      setUser(newUser);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(getAuthErrorMessage(error.code));
    }
    setIsLoading(false);
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error('Errore durante il logout');
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    if (!isConfigured) {
      throw new Error('Firebase non configurato');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('Utente non autenticato');
    }
    try {
      await setDoc(
        doc(db, COLLECTIONS.USERS, user.id),
        {
          ...data,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setUser({ ...user, ...data, updatedAt: new Date() });
    } catch (error) {
      throw new Error('Errore aggiornamento profilo');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};

// Helper per messaggi errore in italiano
const getAuthErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Email non valida',
    'auth/user-disabled': 'Account disabilitato',
    'auth/user-not-found': 'Utente non trovato',
    'auth/wrong-password': 'Password errata',
    'auth/email-already-in-use': 'Email già registrata',
    'auth/weak-password': 'Password troppo debole (minimo 6 caratteri)',
    'auth/operation-not-allowed': 'Operazione non consentita',
    'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
    'auth/network-request-failed': 'Errore di rete. Verifica la connessione',
  };
  return messages[code] || 'Errore di autenticazione';
};

export default AuthContext;
