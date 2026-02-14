import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { userService, collaboratoreService, allievoService } from '../services/userService';
import { User, UserRole, Collaboratore, Allievo } from '../types';

// ============================================
// TIPI CONTEXT
// ============================================

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  collaboratore: Collaboratore | null;
  allievo: Allievo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, cognome: string, ruolo: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    collaboratore: null,
    allievo: null,
    isLoading: true,
    isAuthenticated: false,
    isConfigured: isFirebaseConfigured(),
  });

  // Ascolta i cambiamenti di stato autenticazione Firebase
  useEffect(() => {
    // Se Firebase non e' configurato, usa la modalita' demo
    if (!state.isConfigured) {
      console.warn('Firebase non configurato. Usando modalita\' demo.');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          firebaseUser: null,
          collaboratore: null,
          allievo: null,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    });

    return () => unsubscribe();
  }, [state.isConfigured]);

  // Carica i dati completi dell'utente da Firestore
  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const user = await userService.getUser(firebaseUser.uid);

      if (!user) {
        // Utente Firebase esiste ma non in Firestore
        // Questo non dovrebbe succedere, ma gestiamolo
        console.error('Utente non trovato in Firestore');
        setState(prev => ({
          ...prev,
          firebaseUser,
          isLoading: false,
          isAuthenticated: false,
        }));
        return;
      }

      let collaboratore: Collaboratore | null = null;
      let allievo: Allievo | null = null;

      // Carica dati specifici del ruolo
      if (user.ruolo === 'collaboratore') {
        collaboratore = await collaboratoreService.getByUserId(user.id);
      } else if (user.ruolo === 'allievo') {
        allievo = await allievoService.getByUserId(user.id);
      }

      setState({
        user,
        firebaseUser,
        collaboratore,
        allievo,
        isLoading: false,
        isAuthenticated: true,
        isConfigured: true,
      });
    } catch (error) {
      console.error('Errore caricamento dati utente:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  // Refresh dati utente
  const refreshUser = async () => {
    if (state.firebaseUser) {
      await loadUserData(state.firebaseUser);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    // Modalita' demo se Firebase non e' configurato
    if (!state.isConfigured) {
      await loginDemo(email, password);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Il resto viene gestito da onAuthStateChanged
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      const firebaseError = error as { code?: string };
      // Traduci errori Firebase in italiano
      if (firebaseError.code === 'auth/user-not-found') {
        throw new Error('Utente non trovato');
      } else if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Password errata');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        throw new Error('Troppi tentativi. Riprova piu\' tardi.');
      } else {
        throw new Error('Errore durante il login');
      }
    }
  };

  // Login demo (quando Firebase non e' configurato)
  const loginDemo = async (email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let ruolo: UserRole = 'allievo';
    if (email.includes('titolare')) ruolo = 'titolare';
    if (email.includes('collaboratore')) ruolo = 'collaboratore';

    const mockUser: User = {
      id: 'demo-1',
      email,
      nome: 'Demo',
      cognome: 'User',
      ruolo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    }));
  };

  // Registrazione
  const register = async (
    email: string,
    password: string,
    nome: string,
    cognome: string,
    ruolo: UserRole
  ) => {
    // Modalita' demo se Firebase non e' configurato
    if (!state.isConfigured) {
      await registerDemo(email, nome, cognome, ruolo);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Crea utente in Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Crea profilo utente in Firestore
      const user = await userService.createUser(credential.user.uid, {
        email,
        nome,
        cognome,
        ruolo,
      });

      // Se e' un allievo, crea anche il record allievo
      if (ruolo === 'allievo') {
        await allievoService.create({
          userId: credential.user.uid,
          collaboratoreId: '', // Da assegnare dopo
          dataInizio: new Date(),
          attivo: true,
        });
      }

      // Se e' un collaboratore, crea anche il record collaboratore
      if (ruolo === 'collaboratore') {
        await collaboratoreService.create({
          userId: credential.user.uid,
          percentuale: 60, // Percentuale default
          specializzazioni: [],
          allieviIds: [],
          attivo: true,
        });
      }

      // Il resto viene gestito da onAuthStateChanged
    } catch (error: unknown) {
      setState(prev => ({ ...prev, isLoading: false }));
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        throw new Error('Email gia\' in uso');
      } else if (firebaseError.code === 'auth/weak-password') {
        throw new Error('Password troppo debole (minimo 6 caratteri)');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      } else {
        throw new Error('Errore durante la registrazione');
      }
    }
  };

  // Registrazione demo
  const registerDemo = async (email: string, nome: string, cognome: string, ruolo: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: 'demo-' + Date.now(),
      email,
      nome,
      cognome,
      ruolo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    }));
  };

  // Logout
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (state.isConfigured) {
        await signOut(auth);
      }

      setState({
        user: null,
        firebaseUser: null,
        collaboratore: null,
        allievo: null,
        isLoading: false,
        isAuthenticated: false,
        isConfigured: state.isConfigured,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!state.isConfigured) {
      console.log('Demo: Reset password email sent to:', email);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        throw new Error('Email non trovata');
      } else {
        throw new Error('Errore durante il reset password');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider');
  }
  return context;
};
