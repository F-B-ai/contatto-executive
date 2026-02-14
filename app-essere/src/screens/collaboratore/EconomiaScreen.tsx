import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const EconomiaScreen: React.FC = () => {
  // Mock data
  const stats = {
    guadagnoMese: 1920,
    sessioniMese: 32,
    mediaSessione: 60,
    percentuale: 60,
  };

  const sessioni = [
    { id: '1', allievo: 'Marco Bianchi', data: '14/02', importo: 60, stato: 'completata' },
    { id: '2', allievo: 'Anna Verdi', data: '14/02', importo: 60, stato: 'completata' },
    { id: '3', allievo: 'Giulia Rossi', data: '13/02', importo: 60, stato: 'completata' },
    { id: '4', allievo: 'Paolo Neri', data: '13/02', importo: 60, stato: 'completata' },
    { id: '5', allievo: 'Marco Bianchi', data: '12/02', importo: 60, stato: 'completata' },
  ];

  const quoteDaVersare = 1280; // 40% di 3200

  return (
    <ScrollView style={styles.container}>
      {/* Main Stats */}
      <View style={styles.mainStats}>
        <View style={[styles.mainStatCard, { backgroundColor: COLORS.success }]}>
          <Text style={styles.mainStatLabel}>Guadagno Mese</Text>
          <Text style={styles.mainStatValue}>{stats.guadagnoMese}</Text>
        </View>
        <View style={[styles.mainStatCard, { backgroundColor: COLORS.collaboratore }]}>
          <Text style={styles.mainStatLabel}>Sessioni</Text>
          <Text style={styles.mainStatValue}>{stats.sessioniMese}</Text>
        </View>
      </View>

      {/* Dettaglio Percentuale */}
      <Card title="La Mia Percentuale" style={styles.card}>
        <View style={styles.percentualeContainer}>
          <View style={styles.percentualeItem}>
            <Text style={styles.percentualeLabel}>La tua quota</Text>
            <Text style={[styles.percentualeValue, { color: COLORS.success }]}>{stats.percentuale}%</Text>
          </View>
          <View style={styles.percentualeItem}>
            <Text style={styles.percentualeLabel}>Quota titolare</Text>
            <Text style={[styles.percentualeValue, { color: COLORS.error }]}>{100 - stats.percentuale}%</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${stats.percentuale}%` }]} />
        </View>
      </Card>

      {/* Quote da Versare */}
      <Card style={styles.card}>
        <View style={styles.quoteRow}>
          <View>
            <Text style={styles.quoteLabel}>Quote da versare al titolare</Text>
            <Text style={styles.quoteSubtitle}>Questo mese</Text>
          </View>
          <Text style={styles.quoteValue}>{quoteDaVersare}</Text>
        </View>
      </Card>

      {/* Sessioni Recenti */}
      <Card title="Sessioni Recenti" style={styles.card}>
        {sessioni.map((sessione) => (
          <View key={sessione.id} style={styles.sessioneRow}>
            <View style={styles.sessioneInfo}>
              <Text style={styles.sessioneAllievo}>{sessione.allievo}</Text>
              <Text style={styles.sessioneData}>{sessione.data}</Text>
            </View>
            <Text style={styles.sessioneImporto}>+{sessione.importo}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainStats: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  mainStatCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDERS.radiusLarge,
    alignItems: 'center',
  },
  mainStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  mainStatValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  percentualeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  percentualeItem: {
    alignItems: 'center',
  },
  percentualeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  percentualeValue: {
    ...TYPOGRAPHY.h2,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  quoteSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  quoteValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.error,
  },
  sessioneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  sessioneInfo: {},
  sessioneAllievo: {
    ...TYPOGRAPHY.body,
  },
  sessioneData: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sessioneImporto: {
    ...TYPOGRAPHY.h4,
    color: COLORS.success,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
