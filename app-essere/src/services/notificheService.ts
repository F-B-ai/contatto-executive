// App ESSĒRE - Notifiche Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS, isConfigured } from './firebase';

// Configura il comportamento delle notifiche
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tipi di notifica
export type TipoNotifica =
  | 'sessione_reminder'
  | 'pagamento_scadenza'
  | 'messaggio'
  | 'nuovo_contenuto'
  | 'test_posturale';

interface NotificaData {
  tipo: TipoNotifica;
  titolo: string;
  corpo: string;
  data?: Record<string, string>;
}

// Registra per notifiche push
export const registraPerNotifiche = async (
  userId: string
): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Le notifiche push richiedono un dispositivo fisico');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permesso notifiche non concesso');
    return null;
  }

  // Ottieni il token Expo
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id', // Da configurare
  });

  const token = tokenData.data;

  // Salva il token nel database
  if (isConfigured) {
    await setDoc(
      doc(db, 'pushTokens', userId),
      {
        token,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Configura canale Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3A5F',
    });
  }

  return token;
};

// Programma notifica locale
export const programmaNotificaLocale = async (
  notifica: NotificaData,
  trigger: Notifications.NotificationTriggerInput
): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: notifica.titolo,
      body: notifica.corpo,
      data: {
        tipo: notifica.tipo,
        ...notifica.data,
      },
      sound: true,
    },
    trigger,
  });
};

// Reminder sessione (24h e 1h prima)
export const programmaReminderSessione = async (
  sessioneId: string,
  allievoNome: string,
  dataSessione: Date
): Promise<void> => {
  const ora24hPrima = new Date(dataSessione.getTime() - 24 * 60 * 60 * 1000);
  const ora1hPrima = new Date(dataSessione.getTime() - 60 * 60 * 1000);
  const now = new Date();

  // Notifica 24h prima
  if (ora24hPrima > now) {
    await programmaNotificaLocale(
      {
        tipo: 'sessione_reminder',
        titolo: 'Sessione domani',
        corpo: `Ricordati della sessione con ${allievoNome} domani!`,
        data: { sessioneId },
      },
      { date: ora24hPrima }
    );
  }

  // Notifica 1h prima
  if (ora1hPrima > now) {
    await programmaNotificaLocale(
      {
        tipo: 'sessione_reminder',
        titolo: 'Sessione tra 1 ora',
        corpo: `La sessione con ${allievoNome} inizia tra 1 ora`,
        data: { sessioneId },
      },
      { date: ora1hPrima }
    );
  }
};

// Notifica pagamento in scadenza
export const programmaNotificaPagamento = async (
  pagamentoId: string,
  allievoNome: string,
  importo: number,
  scadenza: Date
): Promise<void> => {
  const giorniPrima = 3;
  const dataNotifica = new Date(
    scadenza.getTime() - giorniPrima * 24 * 60 * 60 * 1000
  );
  const now = new Date();

  if (dataNotifica > now) {
    await programmaNotificaLocale(
      {
        tipo: 'pagamento_scadenza',
        titolo: 'Pagamento in scadenza',
        corpo: `Rata di €${importo} per ${allievoNome} scade il ${scadenza.toLocaleDateString('it-IT')}`,
        data: { pagamentoId },
      },
      { date: dataNotifica }
    );
  }
};

// Notifica immediata per messaggio
export const notificaMessaggio = async (
  mittente: string,
  preview: string
): Promise<void> => {
  await programmaNotificaLocale(
    {
      tipo: 'messaggio',
      titolo: `Nuovo messaggio da ${mittente}`,
      corpo: preview.substring(0, 100),
    },
    null // Notifica immediata
  );
};

// Notifica nuovo contenuto
export const notificaNuovoContenuto = async (
  titolo: string,
  tipo: string
): Promise<void> => {
  await programmaNotificaLocale(
    {
      tipo: 'nuovo_contenuto',
      titolo: 'Nuovo contenuto disponibile',
      corpo: `${tipo}: ${titolo}`,
    },
    null
  );
};

// Cancella tutte le notifiche programmate
export const cancellaTutteNotifiche = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Cancella notifica specifica
export const cancellaNotifica = async (
  notificationId: string
): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

// Ottieni tutte le notifiche programmate
export const getNotificheProgrammate = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// Listener per notifiche ricevute
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Listener per risposta a notifica (tap)
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Resetta badge
export const resetBadge = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};

// Imposta badge
export const setBadge = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

// Ottieni preferenze notifiche utente
export const getPreferenzeNotifiche = async (
  userId: string
): Promise<{
  sessioni: boolean;
  pagamenti: boolean;
  messaggi: boolean;
  contenuti: boolean;
}> => {
  if (!isConfigured) {
    return {
      sessioni: true,
      pagamenti: true,
      messaggi: true,
      contenuti: true,
    };
  }

  const docRef = doc(db, 'preferenzeNotifiche', userId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return {
      sessioni: true,
      pagamenti: true,
      messaggi: true,
      contenuti: true,
    };
  }

  return snapshot.data() as {
    sessioni: boolean;
    pagamenti: boolean;
    messaggi: boolean;
    contenuti: boolean;
  };
};

// Aggiorna preferenze notifiche
export const aggiornaPreferenzeNotifiche = async (
  userId: string,
  preferenze: Partial<{
    sessioni: boolean;
    pagamenti: boolean;
    messaggi: boolean;
    contenuti: boolean;
  }>
): Promise<void> => {
  if (!isConfigured) return;

  const docRef = doc(db, 'preferenzeNotifiche', userId);
  await setDoc(docRef, preferenze, { merge: true });
};
