// App ESSĒRE - Economia Screen (Titolare)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Loading, Button } from '../../components/common';
import {
  StatisticheEconomiche,
  getStatisticheEconomiche,
  getRateInScadenza,
  getRateScadute,
  CATEGORIE_SPESA,
} from '../../services/paymentService';
import { Pagamento, Rata } from '../../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

type PeriodoType = 'mese' | 'trimestre' | 'anno';

interface EconomiaScreenProps {
  onPagamentiPress?: () => void;
  onSpesePress?: () => void;
  onNuovaSpesa?: () => void;
}

export const EconomiaScreen: React.FC<EconomiaScreenProps> = ({
  onPagamentiPress,
  onSpesePress,
  onNuovaSpesa,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoType>('mese');
  const [stats, setStats] = useState<StatisticheEconomiche | null>(null);
  const [rateInScadenza, setRateInScadenza] = useState<{ pagamento: Pagamento; rata: Rata }[]>([]);
  const [rateScadute, setRateScadute] = useState<{ pagamento: Pagamento; rata: Rata }[]>([]);

  const getDateRange = useCallback(() => {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    let startDate: Date;

    switch (periodo) {
      case 'trimestre':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case 'anno':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // mese
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }, [periodo]);

  const loadData = useCallback(async () => {
    try {
      const { startDate, endDate } = getDateRange();

      const [statsData, scadenza, scadute] = await Promise.all([
        getStatisticheEconomiche(startDate, endDate),
        getRateInScadenza(7),
        getRateScadute(),
      ]);

      setStats(statsData);
      setRateInScadenza(scadenza);
      setRateScadute(scadute);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
      Alert.alert('Errore', 'Impossibile caricare le statistiche');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getPeriodoLabel = () => {
    const { startDate, endDate } = getDateRange();
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

    if (periodo === 'mese') {
      return new Date().toLocaleDateString('it-IT', options);
    } else if (periodo === 'trimestre') {
      return `${startDate.toLocaleDateString('it-IT', { month: 'short' })} - ${endDate.toLocaleDateString('it-IT', options)}`;
    } else {
      return `Anno ${new Date().getFullYear()}`;
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento statistiche..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header con selettore periodo */}
      <View style={styles.header}>
        <Text style={styles.title}>Economia</Text>
        <Text style={styles.periodoLabel}>{getPeriodoLabel()}</Text>
      </View>

      {/* Selettore periodo */}
      <View style={styles.periodoSelector}>
        {(['mese', 'trimestre', 'anno'] as PeriodoType[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodoButton, periodo === p && styles.periodoButtonActive]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={[styles.periodoButtonText, periodo === p && styles.periodoButtonTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards principali */}
      <View style={styles.mainCards}>
        <Card style={[styles.mainCard, { borderTopColor: COLORS.success }]}>
          <Text style={styles.mainCardLabel}>Entrate</Text>
          <Text style={[styles.mainCardValue, { color: COLORS.success }]}>
            {formatCurrency(stats?.entrateTotal || 0)}
          </Text>
        </Card>

        <Card style={[styles.mainCard, { borderTopColor: COLORS.error }]}>
          <Text style={styles.mainCardLabel}>Uscite</Text>
          <Text style={[styles.mainCardValue, { color: COLORS.error }]}>
            {formatCurrency(stats?.usciteTotali || 0)}
          </Text>
        </Card>
      </View>

      {/* Profitto */}
      <Card style={styles.profitCard}>
        <Text style={styles.profitLabel}>Profitto Netto</Text>
        <Text style={[
          styles.profitValue,
          { color: (stats?.profitto || 0) >= 0 ? COLORS.success : COLORS.error }
        ]}>
          {formatCurrency(stats?.profitto || 0)}
        </Text>
      </Card>

      {/* Rate in scadenza */}
      {(rateScadute.length > 0 || rateInScadenza.length > 0) && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Pagamenti da Monitorare</Text>

          {rateScadute.length > 0 && (
            <View style={styles.alertSection}>
              <View style={[styles.alertBadge, { backgroundColor: COLORS.error + '20' }]}>
                <Text style={[styles.alertBadgeText, { color: COLORS.error }]}>
                  {rateScadute.length} SCADUTE
                </Text>
              </View>
              {rateScadute.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.rataItem}>
                  <View>
                    <Text style={styles.rataDescrizione}>{item.pagamento.descrizione}</Text>
                    <Text style={[styles.rataScadenza, { color: COLORS.error }]}>
                      Scaduta il {formatDate(item.rata.scadenza)}
                    </Text>
                  </View>
                  <Text style={styles.rataImporto}>{formatCurrency(item.rata.importo)}</Text>
                </View>
              ))}
            </View>
          )}

          {rateInScadenza.length > 0 && (
            <View style={styles.alertSection}>
              <View style={[styles.alertBadge, { backgroundColor: COLORS.warning + '20' }]}>
                <Text style={[styles.alertBadgeText, { color: COLORS.warning }]}>
                  {rateInScadenza.length} IN SCADENZA
                </Text>
              </View>
              {rateInScadenza.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.rataItem}>
                  <View>
                    <Text style={styles.rataDescrizione}>{item.pagamento.descrizione}</Text>
                    <Text style={styles.rataScadenza}>
                      Scade il {formatDate(item.rata.scadenza)}
                    </Text>
                  </View>
                  <Text style={styles.rataImporto}>{formatCurrency(item.rata.importo)}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.viewAllButton} onPress={onPagamentiPress}>
            <Text style={styles.viewAllText}>Vedi tutti i pagamenti →</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Dettaglio entrate */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dettaglio Entrate</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Da allievi</Text>
          <Text style={styles.detailValue}>{formatCurrency(stats?.entrateDaAllievi || 0)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Altre entrate</Text>
          <Text style={styles.detailValue}>{formatCurrency(stats?.altreEntrate || 0)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quota collaboratori</Text>
          <Text style={[styles.detailValue, { color: COLORS.collaboratore }]}>
            -{formatCurrency(stats?.guadagniCollaboratori || 0)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { fontWeight: '600' }]}>La tua quota</Text>
          <Text style={[styles.detailValue, { fontWeight: '700', color: COLORS.primary }]}>
            {formatCurrency(stats?.quotaTitolare || 0)}
          </Text>
        </View>
      </Card>

      {/* Dettaglio uscite */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dettaglio Uscite</Text>
          <TouchableOpacity onPress={onSpesePress}>
            <Text style={styles.viewAllText}>Vedi tutte →</Text>
          </TouchableOpacity>
        </View>

        {CATEGORIE_SPESA.map((cat) => {
          const importo = stats?.uscitePerCategoria[cat.value] || 0;
          if (importo === 0) return null;

          return (
            <View key={cat.value} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{cat.label}</Text>
              <Text style={styles.detailValue}>{formatCurrency(importo)}</Text>
            </View>
          );
        })}

        <Button
          title="+ Aggiungi Spesa"
          variant="outline"
          size="sm"
          onPress={onNuovaSpesa}
          style={styles.addButton}
        />
      </Card>

      {/* Statistiche rate */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Stato Pagamenti</Text>

        <View style={styles.rateStats}>
          <View style={styles.rateStat}>
            <View style={[styles.rateIndicator, { backgroundColor: COLORS.success }]} />
            <Text style={styles.rateStatValue}>{stats?.ratePagate || 0}</Text>
            <Text style={styles.rateStatLabel}>Pagate</Text>
          </View>
          <View style={styles.rateStat}>
            <View style={[styles.rateIndicator, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.rateStatValue}>{stats?.rateInAttesa || 0}</Text>
            <Text style={styles.rateStatLabel}>In attesa</Text>
          </View>
          <View style={styles.rateStat}>
            <View style={[styles.rateIndicator, { backgroundColor: COLORS.error }]} />
            <Text style={styles.rateStatValue}>{stats?.rateScadute || 0}</Text>
            <Text style={styles.rateStatLabel}>Scadute</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  periodoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  periodoSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  periodoButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodoButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  periodoButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  mainCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  mainCard: {
    flex: 1,
    borderTopWidth: 4,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  mainCardLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  mainCardValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  profitCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '05',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  profitLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profitValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  alertSection: {
    marginBottom: SPACING.md,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  alertBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  rataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rataDescrizione: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rataScadenza: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  rataImporto: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllButton: {
    paddingVertical: SPACING.sm,
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    marginTop: SPACING.md,
  },
  rateStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
  },
  rateStat: {
    alignItems: 'center',
  },
  rateIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  rateStatValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rateStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});

export default EconomiaScreen;
