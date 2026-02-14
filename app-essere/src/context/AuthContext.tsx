import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

// ============================================
// TIPI CONTEXT
// ============================================

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, cognome: string, ruolo: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
    isLoading: true,
    isAuthenticated: false,
  });

  // Simula il controllo dello stato di autenticazione all'avvio
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // TODO: Implementare con Firebase Auth
      // Per ora simuliamo un utente non autenticato
      await new Promise(resolve => setTimeout(resolve, 1000));
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Errore controllo auth:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // TODO: Implementare con Firebase Auth
      // Simulazione login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Utente mock per test - determina ruolo dall'email
      let ruolo: UserRole = 'allievo';
      if (email.includes('titolare')) ruolo = 'titolare';
      if (email.includes('collaboratore')) ruolo = 'collaboratore';

      const mockUser: User = {
        id: '1',
        email,
        nome: 'Francesco',
        cognome: 'Rossi',
        ruolo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    nome: string,
    cognome: string,
    ruolo: UserRole
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // TODO: Implementare con Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: '1',
        email,
        nome,
        cognome,
        ruolo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // TODO: Implementare con Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // TODO: Implementare con Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset email sent to:', email);
    } catch (error) {
      throw error;
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
