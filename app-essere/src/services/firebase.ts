// App ESSĒRE - Firebase Configuration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  Auth,
  // @ts-ignore - React Native persistence
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Sostituisci questi valori con le tue credenziali Firebase
// Vai su https://console.firebase.google.com
// 1. Crea un nuovo progetto
// 2. Aggiungi un'app web
// 3. Copia le credenziali qui sotto

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Verifica se le credenziali sono state configurate
export const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (!isConfigured) {
  console.warn(
    '⚠️ Firebase non configurato!\n' +
    'Per configurare Firebase:\n' +
    '1. Vai su https://console.firebase.google.com\n' +
    '2. Crea un nuovo progetto chiamato "app-essere"\n' +
    '3. Abilita Authentication (Email/Password)\n' +
    '4. Abilita Firestore Database\n' +
    '5. Abilita Storage\n' +
    '6. Copia le credenziali in src/services/firebase.ts'
  );
}

// Inizializza Firebase (evita re-inizializzazione in hot reload)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // Auth con persistenza per React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApp();
    auth = getAuth(app);
  }

  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Errore inizializzazione Firebase:', error);
  // Fallback per sviluppo senza Firebase
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

// Collections names (per evitare typo)
export const COLLECTIONS = {
  USERS: 'users',
  COLLABORATORI: 'collaboratori',
  ALLIEVI: 'allievi',
  SESSIONI: 'sessioni',
  PROGRAMMI: 'programmi',
  ESERCIZI: 'esercizi',
  PAGAMENTI: 'pagamenti',
  SPESE: 'spese',
  RICAVI: 'ricavi',
  TEST_POSTURALI: 'testPosturali',
  CONTENUTI: 'contenuti',
  DIARIO: 'diario',
  CHAT: 'chat',
  CALENDARIO: 'calendario',
} as const;

export { app, auth, db, storage };
