import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const CollaboratoriScreen: React.FC = () => {
  // Mock data
  const collaboratori = [
    {
      id: '1',
      nome: 'Luca Verdi',
      specializzazioni: ['Forza', 'Functional'],
      percentuale: 60,
      allieviCount: 8,
      sessioniMese: 32,
      guadagnoMese: 1920,
      attivo: true,
    },
    {
      id: '2',
      nome: 'Sara Bianchi',
      specializzazioni: ['Yoga', 'Posturale'],
      percentuale: 55,
      allieviCount: 12,
      sessioniMese: 48,
      guadagnoMese: 2640,
      attivo: true,
    },
    {
      id: '3',
      nome: 'Marco Rossi',
      specializzazioni: ['Cardio', 'HIIT'],
      percentuale: 50,
      allieviCount: 5,
      sessioniMese: 20,
      guadagnoMese: 1000,
      attivo: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collaboratori.length}</Text>
          <Text style={styles.statLabel}>Totali</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collaboratori.filter(c => c.attivo).length}</Text>
          <Text style={styles.statLabel}>Attivi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collaboratori.reduce((sum, c) => sum + c.allieviCount, 0)}</Text>
          <Text style={styles.statLabel}>Allievi Gestiti</Text>
        </View>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button title="+ Aggiungi Collaboratore" onPress={() => {}} variant="primary" fullWidth />
      </View>

      {/* Lista Collaboratori */}
      {collaboratori.map((collab) => (
        <Card key={collab.id} style={styles.card} onPress={() => {}}>
          <View style={styles.cardHeader}>
            <Avatar name={collab.nome} size="medium" backgroundColor={COLORS.collaboratore} />
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.nome}>{collab.nome}</Text>
              <View style={styles.tagsRow}>
                {collab.specializzazioni.map((spec, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.statusBadge, !collab.attivo && styles.statusBadgeInactive]}>
              <Text style={styles.statusText}>{collab.attivo ? 'Attivo' : 'Inattivo'}</Text>
            </View>
          </View>

          <View style={styles.cardStats}>
            <View style={styles.cardStatItem}>
              <Text style={styles.cardStatValue}>{collab.percentuale}%</Text>
              <Text style={styles.cardStatLabel}>Percentuale</Text>
            </View>
            <View style={styles.cardStatItem}>
              <Text style={styles.cardStatValue}>{collab.allieviCount}</Text>
              <Text style={styles.cardStatLabel}>Allievi</Text>
            </View>
            <View style={styles.cardStatItem}>
              <Text style={styles.cardStatValue}>{collab.sessioniMese}</Text>
              <Text style={styles.cardStatLabel}>Sessioni/Mese</Text>
            </View>
            <View style={styles.cardStatItem}>
              <Text style={[styles.cardStatValue, { color: COLORS.success }]}>
                {collab.guadagnoMese}
              </Text>
              <Text style={styles.cardStatLabel}>Guadagno/Mese</Text>
            </View>
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
  statsRow: {
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
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  addButtonContainer: {
    padding: SPACING.md,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
  tagsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusBadgeInactive: {
    backgroundColor: COLORS.gray400,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
  },
  cardStatItem: {
    alignItems: 'center',
  },
  cardStatValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  cardStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
