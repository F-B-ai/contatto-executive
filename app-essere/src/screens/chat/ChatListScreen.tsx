// App ESSĒRE - Chat List Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card } from '../../components/common';
import { getConversazioniUtente } from '../../services/chatService';
import { getUserById } from '../../services/userService';
import { Conversazione, User } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ChatListScreenProps {
  navigation: any;
}

interface ConversazioneConUtente extends Conversazione {
  altroUtente?: User;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversazioni, setConversazioni] = useState<ConversazioneConUtente[]>([]);

  const loadConversazioni = async () => {
    if (!user) return;

    try {
      const convs = await getConversazioniUtente(user.id);

      // Carica info altri utenti
      const convsConUtenti = await Promise.all(
        convs.map(async (conv) => {
          const altroId = conv.partecipanti.find((p) => p !== user.id);
          let altroUtente: User | undefined;

          if (altroId) {
            altroUtente = (await getUserById(altroId)) || undefined;
          }

          return { ...conv, altroUtente };
        })
      );

      setConversazioni(convsConUtenti);
    } catch (error) {
      console.error('Errore caricamento conversazioni:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversazioni();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversazioni();
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Ieri';
    } else if (days < 7) {
      return date.toLocaleDateString('it-IT', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const renderConversazione = ({ item }: { item: ConversazioneConUtente }) => {
    const nome = item.altroUtente
      ? `${item.altroUtente.nome} ${item.altroUtente.cognome}`
      : 'Utente';

    const iniziali = item.altroUtente
      ? `${item.altroUtente.nome.charAt(0)}${item.altroUtente.cognome.charAt(0)}`
      : '??';

    return (
      <TouchableOpacity
        style={styles.conversazioneItem}
        onPress={() =>
          navigation.navigate('Chat', {
            conversazioneId: item.id,
            partecipanteId: item.altroUtente?.id,
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniziali}</Text>
        </View>

        <View style={styles.conversazioneInfo}>
          <View style={styles.conversazioneHeader}>
            <Text style={styles.nome}>{nome}</Text>
            <Text style={styles.data}>{formatDate(item.ultimoMessaggioAt)}</Text>
          </View>
          <Text style={styles.ultimoMessaggio} numberOfLines={1}>
            {item.ultimoMessaggio || 'Nessun messaggio'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento messaggi..." />;
  }

  return (
    <View style={styles.container}>
      {conversazioni.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Nessuna conversazione</Text>
          <Text style={styles.emptyText}>
            Le tue conversazioni appariranno qui
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversazioni}
          renderItem={renderConversazione}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NuovaChat')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
  },
  conversazioneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  conversazioneInfo: {
    flex: 1,
  },
  conversazioneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nome: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  data: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  ultimoMessaggio: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.white,
  },
});

export default ChatListScreen;
