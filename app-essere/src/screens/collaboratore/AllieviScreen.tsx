import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const AllieviScreen: React.FC = () => {
  // Mock data
  const allievi = [
    {
      id: '1',
      nome: 'Marco Bianchi',
      dataInizio: '15/01/2026',
      sessioni: 24,
      prossima: 'Oggi, 09:00',
      obiettivo: 'Forza e massa',
    },
    {
      id: '2',
      nome: 'Anna Verdi',
      dataInizio: '01/02/2026',
      sessioni: 12,
      prossima: 'Oggi, 10:30',
      obiettivo: 'Tonificazione',
    },
    {
      id: '3',
      nome: 'Giulia Rossi',
      dataInizio: '20/01/2026',
      sessioni: 8,
      prossima: 'Oggi, 14:00',
      obiettivo: 'Dimagrimento',
    },
    {
      id: '4',
      nome: 'Paolo Neri',
      dataInizio: '10/12/2025',
      sessioni: 48,
      prossima: 'Domani, 16:00',
      obiettivo: 'Posturale',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{allievi.length}</Text>
          <Text style={styles.statLabel}>I Miei Allievi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{allievi.reduce((sum, a) => sum + a.sessioni, 0)}</Text>
          <Text style={styles.statLabel}>Sessioni Totali</Text>
        </View>
      </View>

      {/* Lista Allievi */}
      {allievi.map((allievo) => (
        <Card key={allievo.id} style={styles.card} onPress={() => {}}>
          <View style={styles.cardHeader}>
            <Avatar name={allievo.nome} size="medium" backgroundColor={COLORS.allievo} />
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.nome}>{allievo.nome}</Text>
              <Text style={styles.obiettivo}>{allievo.obiettivo}</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Inizio</Text>
              <Text style={styles.detailValue}>{allievo.dataInizio}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sessioni</Text>
              <Text style={styles.detailValue}>{allievo.sessioni}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Prossima</Text>
              <Text style={[styles.detailValue, { color: COLORS.collaboratore }]}>{allievo.prossima}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <Button title="Programma" onPress={() => {}} variant="outline" size="small" />
            <Button title="+ Sessione" onPress={() => {}} variant="primary" size="small" />
          </View>
        </Card>
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.collaboratore,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nome: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  obiettivo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray200,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
