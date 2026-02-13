// App ESSĒRE - Collaboratori Screen (Titolare)
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
import { Card, Button, Loading, Input } from '../../components/common';
import { Collaboratore, User } from '../../types';
import {
  getAllCollaboratori,
  getUser,
  updateCollaboratorePercentuale,
} from '../../services/userService';
import { getStatisticheSessioni } from '../../services/sessionService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface CollaboratoreWithData extends Collaboratore {
  user?: User;
  stats?: {
    sessioni: number;
    completate: number;
  };
}

interface CollaboratoriScreenProps {
  onCollaboratorePress?: (collaboratoreId: string) => void;
  onAddCollaboratore?: () => void;
}

export const CollaboratoriScreen: React.FC<CollaboratoriScreenProps> = ({
  onCollaboratorePress,
  onAddCollaboratore,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collaboratori, setCollaboratori] = useState<CollaboratoreWithData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPercentuale, setEditPercentuale] = useState('');

  const loadCollaboratori = useCallback(async () => {
    try {
      const collabData = await getAllCollaboratori();

      // Carica i dati utente e le statistiche per ogni collaboratore
      const collabWithData = await Promise.all(
        collabData.map(async (collab) => {
          const [userData, stats] = await Promise.all([
            getUser(collab.userId),
            getStatisticheSessioni(collab.userId),
          ]);

          return {
            ...collab,
            user: userData || undefined,
            stats: {
              sessioni: stats.totali,
              completate: stats.completate,
            },
          };
        })
      );

      setCollaboratori(collabWithData);
    } catch (error) {
      console.error('Errore caricamento collaboratori:', error);
      Alert.alert('Errore', 'Impossibile caricare i collaboratori');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCollaboratori();
  }, [loadCollaboratori]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCollaboratori();
  };

  const handleEditPercentuale = (collab: CollaboratoreWithData) => {
    setEditingId(collab.userId);
    setEditPercentuale(collab.percentuale.toString());
  };

  const handleSavePercentuale = async (userId: string) => {
    const percentuale = parseInt(editPercentuale, 10);

    if (isNaN(percentuale) || percentuale < 0 || percentuale > 100) {
      Alert.alert('Errore', 'La percentuale deve essere un numero tra 0 e 100');
      return;
    }

    try {
      await updateCollaboratorePercentuale(userId, percentuale);

      // Aggiorna localmente
      setCollaboratori((prev) =>
        prev.map((c) =>
          c.userId === userId ? { ...c, percentuale } : c
        )
      );

      setEditingId(null);
      Alert.alert('Successo', 'Percentuale aggiornata');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiornare la percentuale');
    }
  };

  const renderCollaboratore = ({ item }: { item: CollaboratoreWithData }) => {
    const isEditing = editingId === item.userId;

    return (
      <Card
        style={styles.card}
        onPress={() => !isEditing && onCollaboratorePress?.(item.userId)}
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
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.attivo ? COLORS.success + '20' : COLORS.error + '20' }]}>
            <Text style={[styles.statusText, { color: item.attivo ? COLORS.success : COLORS.error }]}>
              {item.attivo ? 'Attivo' : 'Inattivo'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.allieviIds.length}</Text>
            <Text style={styles.statLabel}>Allievi</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.stats?.sessioni || 0}</Text>
            <Text style={styles.statLabel}>Sessioni</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.stats?.completate || 0}</Text>
            <Text style={styles.statLabel}>Completate</Text>
          </View>
        </View>

        <View style={styles.percentualeRow}>
          <Text style={styles.percentualeLabel}>Percentuale guadagno:</Text>
          {isEditing ? (
            <View style={styles.editRow}>
              <Input
                value={editPercentuale}
                onChangeText={setEditPercentuale}
                keyboardType="numeric"
                containerStyle={styles.editInput}
              />
              <Text style={styles.percentSign}>%</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSavePercentuale(item.userId)}
              >
                <Text style={styles.saveButtonText}>Salva</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingId(null)}
              >
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.percentualeValue}
              onPress={() => handleEditPercentuale(item)}
            >
              <Text style={styles.percentualeText}>{item.percentuale}%</Text>
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          )}
        </View>

        {item.specializzazioni.length > 0 && (
          <View style={styles.specializzazioni}>
            {item.specializzazioni.map((spec, index) => (
              <View key={index} style={styles.specChip}>
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento collaboratori..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collaboratori}
        renderItem={renderCollaboratore}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun collaboratore</Text>
            <Text style={styles.emptySubtext}>
              Aggiungi un collaboratore per iniziare
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Collaboratori</Text>
            <Text style={styles.subtitle}>{collaboratori.length} totali</Text>
          </View>
        }
      />

      {onAddCollaboratore && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={onAddCollaboratore}>
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
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.collaboratore,
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
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  percentualeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentualeLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  percentualeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  percentualeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editIcon: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editInput: {
    width: 60,
    marginBottom: 0,
  },
  percentSign: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  cancelButton: {
    padding: 6,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.lg,
  },
  specializzazioni: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  specChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  specText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
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

export default CollaboratoriScreen;
