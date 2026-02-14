// App ESSĒRE - Diario Screen
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
import { getDiarioEntries, getStatisticheUmore } from '../../services/diarioService';
import { DiarioEntry } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface DiarioScreenProps {
  navigation: any;
}

export const DiarioScreen: React.FC<DiarioScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [statistiche, setStatistiche] = useState<{
    media: number;
    trend: 'su' | 'giu' | 'stabile';
    entries: number;
  } | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      const [entriesData, statsData] = await Promise.all([
        getDiarioEntries(user.id),
        getStatisticheUmore(user.id, 30),
      ]);

      setEntries(entriesData);
      setStatistiche(statsData);
    } catch (error) {
      console.error('Errore caricamento diario:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getUmoreEmoji = (umore: number) => {
    if (umore >= 9) return '😄';
    if (umore >= 7) return '🙂';
    if (umore >= 5) return '😐';
    if (umore >= 3) return '😕';
    return '😢';
  };

  const getTrendIcon = (trend: 'su' | 'giu' | 'stabile') => {
    switch (trend) {
      case 'su':
        return '📈';
      case 'giu':
        return '📉';
      default:
        return '➡️';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const renderEntry = ({ item }: { item: DiarioEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('DiarioEntryDetail', { entryId: item.id })}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.data)}</Text>
        <View style={styles.umoreContainer}>
          <Text style={styles.umoreEmoji}>{getUmoreEmoji(item.umore)}</Text>
          <Text style={styles.umoreValue}>{item.umore}/10</Text>
        </View>
      </View>

      {item.note && (
        <Text style={styles.entryNote} numberOfLines={2}>
          {item.note}
        </Text>
      )}

      <View style={styles.entryFooter}>
        {item.immagini && item.immagini.length > 0 && (
          <View style={styles.immaginiIndicator}>
            <Text style={styles.immaginiIcon}>📷</Text>
            <Text style={styles.immaginiCount}>{item.immagini.length}</Text>
          </View>
        )}
        {item.condiviso && (
          <View style={styles.condivisoIndicator}>
            <Text style={styles.condivisoIcon}>👁️</Text>
            <Text style={styles.condivisoText}>Condiviso</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading fullScreen text="Caricamento diario..." />;
  }

  return (
    <View style={styles.container}>
      {statistiche && statistiche.entries > 0 && (
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>I tuoi ultimi 30 giorni</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>{getUmoreEmoji(statistiche.media)}</Text>
              <Text style={styles.statValue}>{statistiche.media}</Text>
              <Text style={styles.statLabel}>Media umore</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>{getTrendIcon(statistiche.trend)}</Text>
              <Text style={styles.statValue}>
                {statistiche.trend === 'su'
                  ? 'In crescita'
                  : statistiche.trend === 'giu'
                  ? 'In calo'
                  : 'Stabile'}
              </Text>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📝</Text>
              <Text style={styles.statValue}>{statistiche.entries}</Text>
              <Text style={styles.statLabel}>Voci</Text>
            </View>
          </View>
        </Card>
      )}

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📔</Text>
          <Text style={styles.emptyTitle}>Il tuo diario è vuoto</Text>
          <Text style={styles.emptyText}>
            Inizia a tracciare il tuo percorso aggiungendo la prima voce
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('NuovaDiarioEntry')}
          >
            <Text style={styles.emptyButtonText}>Aggiungi voce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NuovaDiarioEntry')}
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
  statsCard: {
    margin: SPACING.md,
    marginBottom: 0,
  },
  statsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
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
  list: {
    padding: SPACING.md,
  },
  entryCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  entryDate: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  umoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  umoreEmoji: {
    fontSize: 24,
    marginRight: 4,
  },
  umoreValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  entryNote: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  immaginiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  immaginiIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  immaginiCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  condivisoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  condivisoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  condivisoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.info,
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
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.white,
  },
});

export default DiarioScreen;
