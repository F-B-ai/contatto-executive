import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// TODO: Aggiorna con le tue credenziali Firebase
// Vai su: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Types
export interface BotConversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: any;
  status: 'new_lead' | 'client' | 'paused';
  messageCount: number;
}

export interface BotMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: any;
}

// Auth functions
export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore functions
export async function getBotConversations() {
  const q = query(
    collection(db, 'bot_conversations'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as BotConversation));
}

export async function getConversationMessages(conversationId: string) {
  const q = query(
    collection(db, 'bot_conversations', conversationId, 'messages')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as BotMessage));
}

export async function sendTestMessage(
  conversationId: string,
  message: string
) {
  return addDoc(
    collection(db, 'bot_conversations', conversationId, 'messages'),
    {
      sender: 'user',
      text: message,
      timestamp: serverTimestamp(),
    }
  );
}

// Bot control functions
export async function toggleBot(action: 'on' | 'off' | 'reset') {
  return addDoc(collection(db, 'bot_commands'), {
    action,
    executedAt: serverTimestamp(),
    status: 'pending',
  });
}
