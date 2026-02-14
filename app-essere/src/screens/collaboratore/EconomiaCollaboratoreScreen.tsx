// App ESSĒRE - Economia Collaboratore Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card } from '../../components/common';
import { getGuadagniCollaboratore, getPagamentiByCollaboratore } from '../../services/paymentService';
import { getSessioniByCollaboratore } from '../../services/sessionService';
import { Pagamento, Sessione } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface EconomiaCollaboratoreScreenProps {
  navigation: any;
}

export const EconomiaCollaboratoreScreen: React.FC<EconomiaCollaboratoreScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guadagni, setGuadagni] = useState({
    totale: 0,
    questoMese: 0,
    mesePrecedente: 0,
  });
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([]);
  const [sessioni, setSessioni] = useState<Sessione[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'mese' | 'anno'>('mese');

  const loadData = async () => {
    if (!user) return;

    try {
      const [guadagniData, pagamentiData, sessioniData] = await Promise.all([
        getGuadagniCollaboratore(user.id),
        getPagamentiByCollaboratore(user.id),
        getSessioniByCollaboratore(user.id),
      ]);

      setGuadagni(guadagniData);
      setPagamenti(pagamentiData);
      setSessioni(sessioniData);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
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

  const getSessioniMese = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return sessioni.filter(
      (s) => s.data >= startOfMonth && s.stato === 'completata'
    ).length;
  };

  const getTrend = () => {
    if (guadagni.mesePrecedente === 0) return 0;
    return Math.round(
      ((guadagni.questoMese - guadagni.mesePrecedente) / guadagni.mesePrecedente) * 100
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento guadagni..." />;
  }

  const trend = getTrend();
  const sessioniMese = getSessioniMese();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I tuoi guadagni</Text>

        <View style={styles.mainStat}>
          <Text style={styles.mainStatLabel}>Questo mese</Text>
          <Text style={styles.mainStatValue}>€{guadagni.questoMese}</Text>
          <View
            style={[
              styles.trendBadge,
              trend >= 0 ? styles.trendUp : styles.trendDown,
            ]}
          >
            <Text style={styles.trendText}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{sessioniMese}</Text>
          <Text style={styles.statLabel}>Sessioni mese</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>€{guadagni.totale}</Text>
          <Text style={styles.statLabel}>Totale anno</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>€{guadagni.mesePrecedente}</Text>
          <Text style={styles.statLabel}>Mese scorso</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {sessioni.filter((s) => s.stato === 'completata').length}
          </Text>
          <Text style={styles.statLabel}>Sessioni totali</Text>
        </Card>
      </View>

      {/* Ultimi pagamenti */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ultimi pagamenti</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Pagamenti')}>
            <Text style={styles.seeAll}>Vedi tutti</Text>
          </TouchableOpacity>
        </View>

        {pagamenti.length === 0 ? (
          <Text style={styles.emptyText}>Nessun pagamento registrato</Text>
        ) : (
          pagamenti.slice(0, 5).map((pagamento) => (
            <View key={pagamento.id} style={styles.pagamentoItem}>
              <View style={styles.pagamentoInfo}>
                <Text style={styles.pagamentoDescrizione}>
                  {pagamento.descrizione}
                </Text>
                <Text style={styles.pagamentoData}>
                  {pagamento.createdAt.toLocaleDateString('it-IT')}
                </Text>
              </View>
              <View style={styles.pagamentoAmounts}>
                <Text style={styles.pagamentoTotale}>
                  €{pagamento.importoTotale}
                </Text>
                <Text style={styles.pagamentoGuadagno}>
                  +€{pagamento.guadagnoCollaboratore}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Riepilogo */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Riepilogo</Text>

        <View style={styles.riepilogoRow}>
          <Text style={styles.riepilogoLabel}>La tua percentuale</Text>
          <Text style={styles.riepilogoValue}>
            {pagamenti[0]?.percentualeCollaboratore || 50}%
          </Text>
        </View>

        <View style={styles.riepilogoRow}>
          <Text style={styles.riepilogoLabel}>Allievi attivi</Text>
          <Text style={styles.riepilogoValue}>
            {new Set(sessioni.map((s) => s.allievoId)).size}
          </Text>
        </View>

        <View style={styles.riepilogoRow}>
          <Text style={styles.riepilogoLabel}>Media per sessione</Text>
          <Text style={styles.riepilogoValue}>
            €{sessioniMese > 0 ? Math.round(guadagni.questoMese / sessioniMese) : 0}
          </Text>
        </View>
      </Card>

      {/* Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          I guadagni vengono calcolati automaticamente in base alla tua
          percentuale concordata con il titolare per ogni pagamento degli allievi.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.collaboratore,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  mainStat: {
    alignItems: 'center',
  },
  mainStatLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xs,
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
  },
  trendBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginTop: SPACING.sm,
  },
  trendUp: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  trendDown: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  trendText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    alignItems: 'center',
    padding: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.collaboratore,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  pagamentoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pagamentoInfo: {
    flex: 1,
  },
  pagamentoDescrizione: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  pagamentoData: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  pagamentoAmounts: {
    alignItems: 'flex-end',
  },
  pagamentoTotale: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  pagamentoGuadagno: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.success,
  },
  riepilogoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  riepilogoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  riepilogoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoCard: {
    margin: SPACING.md,
    marginBottom: SPACING.xxl,
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}10`,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default EconomiaCollaboratoreScreen;
