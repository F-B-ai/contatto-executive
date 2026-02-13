// App ESSĒRE - Allievi Screen (Shared by Titolare and Collaboratore)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Loading, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Allievo, User } from '../../types';
import {
  getAllAllievi,
  getAllieviByCollaboratore,
  getUser,
} from '../../services/userService';
import { getSessioniByAllievo } from '../../services/sessionService';
import { getProgrammiByAllievo } from '../../services/programService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface AllievoWithData extends Allievo {
  user?: User;
  collaboratoreUser?: User;
  stats?: {
    sessioni: number;
    programmi: number;
  };
}

interface AllieviScreenProps {
  onAllievoPress?: (allievoId: string) => void;
  onAddAllievo?: () => void;
  collaboratoreId?: string; // Se specificato, mostra solo gli allievi di questo collaboratore
}

export const AllieviScreen: React.FC<AllieviScreenProps> = ({
  onAllievoPress,
  onAddAllievo,
  collaboratoreId,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allievi, setAllievi] = useState<AllievoWithData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAllievi = useCallback(async () => {
    try {
      let allieviData: Allievo[];

      // Determina quali allievi caricare in base al ruolo
      if (user?.ruolo === 'titolare' && !collaboratoreId) {
        allieviData = await getAllAllievi();
      } else {
        const collabId = collaboratoreId || user?.id;
        allieviData = await getAllieviByCollaboratore(collabId!);
      }

      // Carica i dati utente e le statistiche per ogni allievo
      const allieviWithData = await Promise.all(
        allieviData.map(async (allievo) => {
          const [userData, collabUser, sessioni, programmi] = await Promise.all([
            getUser(allievo.userId),
            allievo.collaboratoreId ? getUser(allievo.collaboratoreId) : null,
            getSessioniByAllievo(allievo.userId),
            getProgrammiByAllievo(allievo.userId),
          ]);

          return {
            ...allievo,
            user: userData || undefined,
            collaboratoreUser: collabUser || undefined,
            stats: {
              sessioni: sessioni.length,
              programmi: programmi.length,
            },
          };
        })
      );

      setAllievi(allieviWithData);
    } catch (error) {
      console.error('Errore caricamento allievi:', error);
      Alert.alert('Errore', 'Impossibile caricare gli allievi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, collaboratoreId]);

  useEffect(() => {
    loadAllievi();
  }, [loadAllievi]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllievi();
  };

  // Filtra allievi in base alla ricerca
  const filteredAllievi = allievi.filter((allievo) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${allievo.user?.nome} ${allievo.user?.cognome}`.toLowerCase();
    return fullName.includes(query) || allievo.user?.email?.toLowerCase().includes(query);
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderAllievo = ({ item }: { item: AllievoWithData }) => {
    return (
      <Card
        style={styles.card}
        onPress={() => onAllievoPress?.(item.userId)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.nome?.[0]}{item.user?.cognome?.[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.nome}>
              {item.user?.nome} {item.user?.cognome}
            </Text>
            <Text style={styles.email}>{item.user?.email}</Text>
            {item.collaboratoreUser && user?.ruolo === 'titolare' && (
              <Text style={styles.coach}>
                Coach: {item.collaboratoreUser.nome} {item.collaboratoreUser.cognome}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.attivo ? COLORS.success + '20' : COLORS.error + '20' }]}>
            <Text style={[styles.statusText, { color: item.attivo ? COLORS.success : COLORS.error }]}>
              {item.attivo ? 'Attivo' : 'Inattivo'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.stats?.sessioni || 0}</Text>
            <Text style={styles.statLabel}>Sessioni</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.stats?.programmi || 0}</Text>
            <Text style={styles.statLabel}>Programmi</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {item.dataInizio ? formatDate(item.dataInizio) : '-'}
            </Text>
            <Text style={styles.statLabel}>Data Inizio</Text>
          </View>
        </View>

        {item.obiettivo && (
          <View style={styles.obiettivo}>
            <Text style={styles.obiettivoLabel}>Obiettivo:</Text>
            <Text style={styles.obiettivoText} numberOfLines={2}>
              {item.obiettivo}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento allievi..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAllievi}
        renderItem={renderAllievo}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nessun risultato' : 'Nessun allievo'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Prova con una ricerca diversa'
                : 'Aggiungi un allievo per iniziare'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Allievi</Text>
              <Text style={styles.subtitle}>{allievi.length} totali</Text>
            </View>
            <Input
              placeholder="Cerca allievo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
          </View>
        }
      />

      {onAddAllievo && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={onAddAllievo}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  searchInput: {
    marginBottom: 0,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZE.lg,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  coach: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.collaboratore,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  obiettivo: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  obiettivoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  obiettivoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '300',
  },
});

export default AllieviScreen;
