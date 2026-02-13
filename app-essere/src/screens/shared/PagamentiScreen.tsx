// App ESSĒRE - Pagamenti Screen
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
import { Card, Loading, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Pagamento, User } from '../../types';
import {
  getAllPagamenti,
  getPagamentiByCollaboratore,
  getPagamentiByAllievo,
  pagaRata,
} from '../../services/paymentService';
import { getUser } from '../../services/userService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface PagamentoWithData extends Pagamento {
  allievoUser?: User;
}

interface PagamentiScreenProps {
  onPagamentoPress?: (pagamentoId: string) => void;
  onNuovoPagamento?: () => void;
}

export const PagamentiScreen: React.FC<PagamentiScreenProps> = ({
  onPagamentoPress,
  onNuovoPagamento,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagamenti, setPagamenti] = useState<PagamentoWithData[]>([]);
  const [filter, setFilter] = useState<'tutti' | 'attivi' | 'completati'>('tutti');

  const loadPagamenti = useCallback(async () => {
    try {
      let pagamentiData: Pagamento[];

      if (user?.ruolo === 'titolare') {
        pagamentiData = await getAllPagamenti();
      } else if (user?.ruolo === 'collaboratore') {
        pagamentiData = await getPagamentiByCollaboratore(user.id);
      } else {
        pagamentiData = await getPagamentiByAllievo(user!.id);
      }

      // Carica i dati degli allievi
      const pagamentiWithData = await Promise.all(
        pagamentiData.map(async (p) => {
          const allievoUser = await getUser(p.allievoId);
          return { ...p, allievoUser: allievoUser || undefined };
        })
      );

      setPagamenti(pagamentiWithData);
    } catch (error) {
      console.error('Errore caricamento pagamenti:', error);
      Alert.alert('Errore', 'Impossibile caricare i pagamenti');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadPagamenti();
  }, [loadPagamenti]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPagamenti();
  };

  const handlePagaRata = async (pagamento: Pagamento, numeroRata: number) => {
    Alert.alert(
      'Conferma Pagamento',
      `Confermi il pagamento della rata ${numeroRata}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: async () => {
            try {
              await pagaRata(pagamento.id, numeroRata);
              Alert.alert('Successo', 'Rata segnata come pagata');
              loadPagamenti();
            } catch (error) {
              Alert.alert('Errore', 'Impossibile registrare il pagamento');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatoPagamento = (pagamento: Pagamento): 'completato' | 'attivo' | 'scaduto' => {
    const ratePagate = pagamento.rate.filter((r) => r.pagata).length;
    const oggi = new Date();

    if (ratePagate === pagamento.rate.length) {
      return 'completato';
    }

    const rateScadute = pagamento.rate.filter((r) => !r.pagata && new Date(r.scadenza) < oggi);
    if (rateScadute.length > 0) {
      return 'scaduto';
    }

    return 'attivo';
  };

  const filteredPagamenti = pagamenti.filter((p) => {
    const stato = getStatoPagamento(p);
    if (filter === 'tutti') return true;
    if (filter === 'attivi') return stato === 'attivo' || stato === 'scaduto';
    return stato === 'completato';
  });

  const renderPagamento = ({ item }: { item: PagamentoWithData }) => {
    const stato = getStatoPagamento(item);
    const ratePagate = item.rate.filter((r) => r.pagata).length;
    const importoPagato = item.rate.filter((r) => r.pagata).reduce((sum, r) => sum + r.importo, 0);
    const prossimaRata = item.rate.find((r) => !r.pagata);

    const statoColors = {
      completato: COLORS.success,
      attivo: COLORS.info,
      scaduto: COLORS.error,
    };

    return (
      <Card style={styles.card} onPress={() => onPagamentoPress?.(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.allievoInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.allievoUser?.nome?.[0]}{item.allievoUser?.cognome?.[0]}
              </Text>
            </View>
            <View>
              <Text style={styles.allievoNome}>
                {item.allievoUser?.nome} {item.allievoUser?.cognome}
              </Text>
              <Text style={styles.descrizione}>{item.descrizione}</Text>
            </View>
          </View>
          <View style={[styles.statoBadge, { backgroundColor: statoColors[stato] + '20' }]}>
            <Text style={[styles.statoText, { color: statoColors[stato] }]}>
              {stato.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {ratePagate}/{item.rate.length} rate pagate
            </Text>
            <Text style={styles.importoText}>
              {formatCurrency(importoPagato)} / {formatCurrency(item.importoTotale)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(ratePagate / item.rate.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {prossimaRata && stato !== 'completato' && (
          <View style={styles.prossimaRata}>
            <View>
              <Text style={styles.prossimaRataLabel}>
                {new Date(prossimaRata.scadenza) < new Date() ? 'RATA SCADUTA' : 'Prossima rata'}
              </Text>
              <Text style={styles.prossimaRataDate}>
                Rata {prossimaRata.numero} - {formatDate(prossimaRata.scadenza)}
              </Text>
            </View>
            <View style={styles.prossimaRataRight}>
              <Text style={styles.prossimaRataImporto}>
                {formatCurrency(prossimaRata.importo)}
              </Text>
              {user?.ruolo !== 'allievo' && (
                <TouchableOpacity
                  style={styles.pagaButton}
                  onPress={() => handlePagaRata(item, prossimaRata.numero)}
                >
                  <Text style={styles.pagaButtonText}>Segna pagata</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {user?.ruolo !== 'allievo' && (
          <View style={styles.guadagniRow}>
            <Text style={styles.guadagniLabel}>
              Guadagno coach: {formatCurrency(item.guadagnoCollaboratore)}
            </Text>
            <Text style={styles.guadagniLabel}>
              Quota titolare: {formatCurrency(item.quotaTitolare)}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento pagamenti..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        {(['tutti', 'attivi', 'completati'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPagamenti}
        renderItem={renderPagamento}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun pagamento</Text>
          </View>
        }
      />

      {onNuovoPagamento && user?.ruolo !== 'allievo' && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={onNuovoPagamento}>
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
  filterContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  allievoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  allievoNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  descrizione: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statoText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  importoText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  prossimaRata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  prossimaRataLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  prossimaRataDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  prossimaRataRight: {
    alignItems: 'flex-end',
  },
  prossimaRataImporto: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pagaButton: {
    marginTop: 4,
  },
  pagaButtonText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  guadagniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  guadagniLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
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

export default PagamentiScreen;
