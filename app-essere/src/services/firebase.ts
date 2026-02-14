import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configurazione Firebase
// Le credenziali vengono lette dalle variabili d'ambiente Expo
// Crea un file .env nella root del progetto con le tue credenziali
// Vedi FIREBASE_SETUP.md per istruzioni dettagliate
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Verifica se le credenziali sono configurate
export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" &&
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Inizializza Firebase (evita reinizializzazione)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inizializza Auth con persistenza per React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // Per mobile, usa AsyncStorage per la persistenza
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Se già inizializzato, usa getAuth
    auth = getAuth(app);
  }
}

// Inizializza Firestore e Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
