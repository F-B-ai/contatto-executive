import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import {
  getConversationMessages,
  sendTestMessage,
  BotMessage,
  toggleBot,
} from '../lib/firebase';

export default function ConversationScreen() {
  const { id, name } = useLocalSearchParams();
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [user, id]);

  const loadMessages = async () => {
    if (!id) return;
    try {
      const data = await getConversationMessages(id as string);
      setMessages(data.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setSending(true);
    try {
      await sendTestMessage(id as string, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile inviare il messaggio');
    } finally {
      setSending(false);
    }
  };

  const handleBotControl = async (action: 'on' | 'off') => {
    try {
      await toggleBot(action);
      Alert.alert(
        'Bot',
        `Comando ${action.toUpperCase()} inviato al bot`
      );
    } catch (error) {
      Alert.alert('Errore', 'Impossibile controllare il bot');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C1121F" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.messageCount}>
          {messages.length} messaggi
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'bot'
                ? styles.botMessage
                : styles.userMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nessun messaggio ancora
            </Text>
          </View>
        }
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.offButton]}
          onPress={() =>
            Alert.alert(
              'Pausa Bot',
              'Mettere il bot in pausa?',
              [
                { text: 'Annulla', style: 'cancel' },
                {
                  text: 'Pausa',
                  onPress: () => handleBotControl('off'),
                  style: 'destructive',
                },
              ]
            )
          }
        >
          <Text style={styles.controlButtonText}>⏸ Pausa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.onButton]}
          onPress={() => handleBotControl('on')}
        >
          <Text style={styles.controlButtonText}>▶ Attiva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Invia messaggio di test..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxHeight={100}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Invia</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#C1121F',
    padding: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageBubble: {
    marginVertical: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#e8e8e8',
    marginRight: 'auto',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessage: {
    backgroundColor: '#e8e8e8',
    marginRight: 'auto',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessage: {
    backgroundColor: '#e8e8e8',
    marginRight: 'auto',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessage: {
    backgroundColor: '#e8e8e8',
    marginRight: 'auto',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessage: {
    backgroundColor: '#e8e8e8',
    marginRight: 'auto',
  },
  userMessage: {
    backgroundColor: '#C1121F',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  offButton: {
    backgroundColor: '#f5f5f5',
  },
  onButton: {
    backgroundColor: '#C1121F',
  },
  controlButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  onButton: {
    backgroundColor: '#C1121F',
  },
  controlButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#C1121F',
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
