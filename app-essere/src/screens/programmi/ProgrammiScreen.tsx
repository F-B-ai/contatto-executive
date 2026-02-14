// App ESSĒRE - Programmi Screen
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
import { getAllProgrammi, getProgrammiByCollaboratore } from '../../services/programService';
import { Programma } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ProgrammiScreenProps {
  navigation: any;
}

export const ProgrammiScreen: React.FC<ProgrammiScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [programmi, setProgrammi] = useState<Programma[]>([]);

  const loadProgrammi = async () => {
    if (!user) return;

    try {
      const data = user.ruolo === 'titolare'
        ? await getAllProgrammi()
        : await getProgrammiByCollaboratore(user.id);

      setProgrammi(data);
    } catch (error) {
      console.error('Errore caricamento programmi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProgrammi();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProgrammi();
  };

  const renderProgramma = ({ item }: { item: Programma }) => (
    <TouchableOpacity
      style={styles.programmaCard}
      onPress={() => navigation.navigate('ProgrammaDetail', { id: item.id })}
    >
      <View style={styles.programmaHeader}>
        <View style={styles.programmaIcon}>
          <Text style={styles.programmaIconText}>📋</Text>
        </View>
        <View style={styles.programmaInfo}>
          <Text style={styles.programmaNome}>{item.nome}</Text>
          <Text style={styles.programmaDurata}>
            {item.durataSettimane} settimane
          </Text>
        </View>
        <View style={styles.assegnatiBadge}>
          <Text style={styles.assegnatiText}>
            {item.assegnatoA?.length || 0} allievi
          </Text>
        </View>
      </View>

      {item.descrizione && (
        <Text style={styles.programmaDescrizione} numberOfLines={2}>
          {item.descrizione}
        </Text>
      )}

      <View style={styles.programmaFooter}>
        <Text style={styles.sessioniCount}>
          {item.sessioni?.length || 0} sessioni
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading fullScreen text="Caricamento programmi..." />;
  }

  return (
    <View style={styles.container}>
      {programmi.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Nessun programma</Text>
          <Text style={styles.emptyText}>
            Crea il tuo primo programma di allenamento
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('NuovoProgramma')}
          >
            <Text style={styles.emptyButtonText}>Crea programma</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={programmi}
          renderItem={renderProgramma}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NuovoProgramma')}
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
  programmaCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  programmaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  programmaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  programmaIconText: {
    fontSize: 20,
  },
  programmaInfo: {
    flex: 1,
  },
  programmaNome: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  programmaDurata: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  assegnatiBadge: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  assegnatiText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  programmaDescrizione: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  programmaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessioniCount: {
    fontSize: FONT_SIZE.sm,
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

export default ProgrammiScreen;
