import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const EconomiaScreen: React.FC = () => {
  const [periodo, setPeriodo] = useState<'mese' | 'anno'>('mese');

  // Mock data
  const riepilogo = {
    entrateAllievi: 8500,
    quoteCollaboratori: 4200,
    altreEntrate: 300,
    speseFisse: 1500,
    speseVariabili: 800,
  };

  const totaleEntrate = riepilogo.entrateAllievi + riepilogo.altreEntrate;
  const totaleUscite = riepilogo.quoteCollaboratori + riepilogo.speseFisse + riepilogo.speseVariabili;
  const profitto = totaleEntrate - totaleUscite;

  const movimentiRecenti = [
    { id: '1', tipo: 'entrata', descrizione: 'Pagamento Marco Bianchi', importo: 150, data: '14/02' },
    { id: '2', tipo: 'uscita', descrizione: 'Quota Luca Verdi', importo: 90, data: '14/02' },
    { id: '3', tipo: 'entrata', descrizione: 'Pagamento Anna Verdi', importo: 200, data: '13/02' },
    { id: '4', tipo: 'uscita', descrizione: 'Affitto palestra', importo: 800, data: '10/02' },
    { id: '5', tipo: 'uscita', descrizione: 'Attrezzature', importo: 250, data: '08/02' },
  ];

  const rateInScadenza = [
    { id: '1', allievo: 'Paolo Neri', importo: 100, scadenza: '20/02/2026' },
    { id: '2', allievo: 'Maria Rossi', importo: 150, scadenza: '25/02/2026' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Periodo Selector */}
      <View style={styles.periodoContainer}>
        <TouchableOpacity
          style={[styles.periodoButton, periodo === 'mese' && styles.periodoButtonActive]}
          onPress={() => setPeriodo('mese')}
        >
          <Text style={[styles.periodoText, periodo === 'mese' && styles.periodoTextActive]}>
            Questo Mese
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodoButton, periodo === 'anno' && styles.periodoButtonActive]}
          onPress={() => setPeriodo('anno')}
        >
          <Text style={[styles.periodoText, periodo === 'anno' && styles.periodoTextActive]}>
            Quest'Anno
          </Text>
        </TouchableOpacity>
      </View>

      {/* Riepilogo Principale */}
      <View style={styles.mainStatsContainer}>
        <View style={[styles.mainStatCard, { backgroundColor: COLORS.success }]}>
          <Text style={styles.mainStatLabel}>Entrate</Text>
          <Text style={styles.mainStatValue}>+{totaleEntrate.toLocaleString()}</Text>
        </View>
        <View style={[styles.mainStatCard, { backgroundColor: COLORS.error }]}>
          <Text style={styles.mainStatLabel}>Uscite</Text>
          <Text style={styles.mainStatValue}>-{totaleUscite.toLocaleString()}</Text>
        </View>
        <View style={[styles.mainStatCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.mainStatLabel}>Profitto</Text>
          <Text style={styles.mainStatValue}>{profitto.toLocaleString()}</Text>
        </View>
      </View>

      {/* Dettaglio Entrate/Uscite */}
      <Card title="Dettaglio" style={styles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pagamenti allievi</Text>
          <Text style={[styles.detailValue, { color: COLORS.success }]}>
            +{riepilogo.entrateAllievi.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Altre entrate</Text>
          <Text style={[styles.detailValue, { color: COLORS.success }]}>
            +{riepilogo.altreEntrate.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.detailRow, styles.detailRowBorder]}>
          <Text style={styles.detailLabel}>Quote collaboratori</Text>
          <Text style={[styles.detailValue, { color: COLORS.error }]}>
            -{riepilogo.quoteCollaboratori.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Spese fisse</Text>
          <Text style={[styles.detailValue, { color: COLORS.error }]}>
            -{riepilogo.speseFisse.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Spese variabili</Text>
          <Text style={[styles.detailValue, { color: COLORS.error }]}>
            -{riepilogo.speseVariabili.toLocaleString()}
          </Text>
        </View>
      </Card>

      {/* Rate in Scadenza */}
      <Card title="Rate in Scadenza" style={styles.card}>
        {rateInScadenza.map((rata) => (
          <View key={rata.id} style={styles.rataRow}>
            <View>
              <Text style={styles.rataAllievo}>{rata.allievo}</Text>
              <Text style={styles.rataScadenza}>Scadenza: {rata.scadenza}</Text>
            </View>
            <Text style={styles.rataImporto}>{rata.importo}</Text>
          </View>
        ))}
      </Card>

      {/* Movimenti Recenti */}
      <Card title="Movimenti Recenti" style={styles.card}>
        {movimentiRecenti.map((mov) => (
          <View key={mov.id} style={styles.movimentoRow}>
            <View style={styles.movimentoInfo}>
              <Text style={styles.movimentoDescrizione}>{mov.descrizione}</Text>
              <Text style={styles.movimentoData}>{mov.data}</Text>
            </View>
            <Text
              style={[
                styles.movimentoImporto,
                { color: mov.tipo === 'entrata' ? COLORS.success : COLORS.error },
              ]}
            >
              {mov.tipo === 'entrata' ? '+' : '-'}{mov.importo}
            </Text>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button title="+ Aggiungi Spesa" onPress={() => {}} variant="outline" />
        <Button title="+ Registra Entrata" onPress={() => {}} variant="primary" />
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  periodoContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radiusMedium,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
  },
  periodoButtonActive: {
    backgroundColor: COLORS.titolare,
  },
  periodoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  periodoTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  mainStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  mainStatCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDERS.radiusLarge,
    alignItems: 'center',
  },
  mainStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  mainStatValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  card: {
    margin: SPACING.md,
    marginTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  detailRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  detailLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  rataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  rataAllievo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  rataScadenza: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
  },
  rataImporto: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  movimentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  movimentoInfo: {},
  movimentoDescrizione: {
    ...TYPOGRAPHY.body,
  },
  movimentoData: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  movimentoImporto: {
    ...TYPOGRAPHY.h4,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
