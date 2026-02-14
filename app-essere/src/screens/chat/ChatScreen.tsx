// App ESSĒRE - Chat Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../../components/common';
import {
  getMessaggi,
  inviaMessaggio,
  subscribeToMessaggi,
  segnaMessaggiLetti,
  creaConversazione,
  getConversazione,
} from '../../services/chatService';
import { getUserById } from '../../services/userService';
import { Messaggio, User } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ChatScreenProps {
  route: {
    params: {
      conversazioneId?: string;
      partecipanteId?: string;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversazioneId: initialConvId, partecipanteId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [conversazioneId, setConversazioneId] = useState(initialConvId);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [sending, setSending] = useState(false);
  const [altroUtente, setAltroUtente] = useState<User | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    if (!conversazioneId) return;

    // Sottoscrivi ai messaggi in tempo reale
    const unsubscribe = subscribeToMessaggi(conversazioneId, (nuoviMessaggi) => {
      setMessaggi(nuoviMessaggi);

      // Segna come letti
      if (user) {
        segnaMessaggiLetti(conversazioneId, user.id);
      }
    });

    return () => unsubscribe();
  }, [conversazioneId, user]);

  const initChat = async () => {
    try {
      let convId = initialConvId;

      // Se non c'è conversazioneId ma c'è partecipanteId, crea/trova conversazione
      if (!convId && partecipanteId && user) {
        const conv = await creaConversazione([user.id, partecipanteId]);
        convId = conv.id;
        setConversazioneId(conv.id);
      }

      if (convId) {
        // Carica messaggi esistenti
        const msgs = await getMessaggi(convId);
        setMessaggi(msgs);

        // Carica info altro utente
        const conv = await getConversazione(convId);
        if (conv) {
          const altroId = conv.partecipanti.find((p) => p !== user?.id);
          if (altroId) {
            const altro = await getUserById(altroId);
            setAltroUtente(altro);

            // Aggiorna titolo navigazione
            if (altro) {
              navigation.setOptions({
                title: `${altro.nome} ${altro.cognome}`,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Errore inizializzazione chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!nuovoMessaggio.trim() || !conversazioneId || !user) return;

    setSending(true);
    try {
      await inviaMessaggio(conversazioneId, user.id, nuovoMessaggio.trim());
      setNuovoMessaggio('');
    } catch (error) {
      console.error('Errore invio messaggio:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessaggio = ({ item }: { item: Messaggio }) => {
    const isOwnMessage = item.mittente === user?.id;

    return (
      <View
        style={[
          styles.messaggioContainer,
          isOwnMessage ? styles.messaggioOwn : styles.messaggioOther,
        ]}
      >
        <View
          style={[
            styles.messaggioBubble,
            isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messaggioText,
              isOwnMessage ? styles.textOwn : styles.textOther,
            ]}
          >
            {item.testo}
          </Text>
          <Text
            style={[
              styles.messaggioTime,
              isOwnMessage ? styles.timeOwn : styles.timeOther,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento chat..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messaggi}
        renderItem={renderMessaggio}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Inizia la conversazione con un messaggio
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nuovoMessaggio}
          onChangeText={setNuovoMessaggio}
          placeholder="Scrivi un messaggio..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!nuovoMessaggio.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!nuovoMessaggio.trim() || sending}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesList: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  messaggioContainer: {
    marginBottom: SPACING.sm,
  },
  messaggioOwn: {
    alignItems: 'flex-end',
  },
  messaggioOther: {
    alignItems: 'flex-start',
  },
  messaggioBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  messaggioText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 20,
  },
  textOwn: {
    color: COLORS.white,
  },
  textOther: {
    color: COLORS.textPrimary,
  },
  messaggioTime: {
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeOther: {
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textDisabled,
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
});

export default ChatScreen;
