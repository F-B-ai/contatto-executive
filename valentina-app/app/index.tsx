import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import { getBotConversations, logoutUser, BotConversation } from '../lib/firebase';

export default function HomeScreen() {
  const [conversations, setConversations] = useState<BotConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      const data = await getBotConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Errore', 'Impossibile caricare le conversazioni');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Sei sicuro?', [
      {
        text: 'Annulla',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await logoutUser();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C1121F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Conversazioni Bot</Text>
          <Text style={styles.headerSubtitle}>
            {conversations.length} conversazioni attive
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Esci</Text>
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Nessuna conversazione in corso
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Le conversazioni del bot appariranno qui
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() =>
                router.push({
                  pathname: '/conversation',
                  params: { id: item.id, name: item.contactName },
                })
              }
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.contactName}>{item.contactName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      styles[`status_${item.status}`],
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.status === 'new_lead'
                        ? 'Nuovo Lead'
                        : item.status === 'client'
                          ? 'Cliente'
                          : 'In Pausa'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.lastMessage} numberOfLines={2}>
                  {item.lastMessage}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.messageCount}>
                    {item.messageCount} messaggi
                  </Text>
                  <Text style={styles.timestamp}>
                    {new Date(item.lastMessageTime?.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  status_new_lead: {
    backgroundColor: '#E8F4F8',
  },
  status_client: {
    backgroundColor: '#E8F8E8',
  },
  status_paused: {
    backgroundColor: '#F8F0E8',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageCount: {
    fontSize: 11,
    color: '#999',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
});
