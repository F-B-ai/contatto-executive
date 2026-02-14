// App ESSĒRE - Test Posturali List Screen
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
import {
  getTestPosturaliAllievo,
  getTestPosturaliCollaboratore,
} from '../../services/testPosturaleService';
import { getUserById } from '../../services/userService';
import { TestPosturale, User } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface TestPosturaliListScreenProps {
  navigation: any;
}

interface TestConUtente extends TestPosturale {
  allievo?: User;
}

export const TestPosturaliListScreen: React.FC<TestPosturaliListScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState<TestConUtente[]>([]);

  const loadTests = async () => {
    if (!user) return;

    try {
      let testsData: TestPosturale[];

      if (user.ruolo === 'allievo') {
        testsData = await getTestPosturaliAllievo(user.id);
      } else {
        testsData = await getTestPosturaliCollaboratore(user.id);
      }

      // Carica info allievi
      const testsConUtenti = await Promise.all(
        testsData.map(async (test) => {
          const allievo = await getUserById(test.allievoId);
          return { ...test, allievo: allievo || undefined };
        })
      );

      setTests(testsConUtenti);
    } catch (error) {
      console.error('Errore caricamento test:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTests();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderTest = ({ item }: { item: TestConUtente }) => {
    const nomeAllievo = item.allievo
      ? `${item.allievo.nome} ${item.allievo.cognome}`
      : 'Allievo';

    const hasReport = !!item.report;

    return (
      <TouchableOpacity
        style={styles.testCard}
        onPress={() =>
          navigation.navigate('TestPosturaleDetail', { testId: item.id })
        }
      >
        <View style={styles.testHeader}>
          <View style={styles.testIcon}>
            <Text style={styles.testIconText}>🧍</Text>
          </View>
          <View style={styles.testInfo}>
            {user?.ruolo !== 'allievo' && (
              <Text style={styles.testAllievo}>{nomeAllievo}</Text>
            )}
            <Text style={styles.testDate}>{formatDate(item.data)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              hasReport ? styles.statusComplete : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                hasReport ? styles.statusTextComplete : styles.statusTextPending,
              ]}
            >
              {hasReport ? 'Completato' : 'In corso'}
            </Text>
          </View>
        </View>

        {hasReport && (
          <Text style={styles.testPreview} numberOfLines={2}>
            {item.report?.replace(/^##.*\n/gm, '').substring(0, 100)}...
          </Text>
        )}

        <View style={styles.testFooter}>
          <Text style={styles.testPhotos}>
            📷 {item.immagini?.length || 0} foto
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento test..." />;
  }

  return (
    <View style={styles.container}>
      {tests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🧍</Text>
          <Text style={styles.emptyTitle}>Nessun test posturale</Text>
          <Text style={styles.emptyText}>
            {user?.ruolo === 'allievo'
              ? 'Non hai ancora effettuato test posturali'
              : 'Non hai ancora creato test posturali per i tuoi allievi'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
  },
  testCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.info}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  testIconText: {
    fontSize: 24,
  },
  testInfo: {
    flex: 1,
  },
  testAllievo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  testDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusComplete: {
    backgroundColor: `${COLORS.success}20`,
  },
  statusPending: {
    backgroundColor: `${COLORS.warning}20`,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  statusTextComplete: {
    color: COLORS.success,
  },
  statusTextPending: {
    color: COLORS.warning,
  },
  testPreview: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  testFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testPhotos: {
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
  },
});

export default TestPosturaliListScreen;
