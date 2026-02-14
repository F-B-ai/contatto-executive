import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const ProgrammiScreen: React.FC = () => {
  // Mock data
  const programmi = [
    {
      id: '1',
      nome: 'Forza Base',
      durata: 8,
      sessioni: 3,
      assegnato: ['Marco Bianchi', 'Paolo Neri'],
    },
    {
      id: '2',
      nome: 'Tonificazione Total Body',
      durata: 12,
      sessioni: 4,
      assegnato: ['Anna Verdi'],
    },
    {
      id: '3',
      nome: 'Dimagrimento Intenso',
      durata: 6,
      sessioni: 5,
      assegnato: ['Giulia Rossi'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button title="+ Crea Nuovo Programma" onPress={() => {}} variant="primary" fullWidth />
      </View>

      {/* Lista Programmi */}
      <Text style={styles.sectionTitle}>I Miei Programmi</Text>

      {programmi.map((programma) => (
        <Card key={programma.id} style={styles.card} onPress={() => {}}>
          <View style={styles.cardHeader}>
            <Text style={styles.programmaNome}>{programma.nome}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{programma.assegnato.length} allievi</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{programma.durata}</Text>
              <Text style={styles.detailLabel}>settimane</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{programma.sessioni}</Text>
              <Text style={styles.detailLabel}>sessioni/sett</Text>
            </View>
          </View>

          <View style={styles.assegnatoContainer}>
            <Text style={styles.assegnatoLabel}>Assegnato a:</Text>
            <Text style={styles.assegnatoNomi}>{programma.assegnato.join(', ')}</Text>
          </View>

          <View style={styles.cardActions}>
            <Button title="Modifica" onPress={() => {}} variant="outline" size="small" />
            <Button title="Assegna" onPress={() => {}} variant="primary" size="small" />
          </View>
        </Card>
      ))}

      {/* Libreria Esercizi */}
      <Text style={styles.sectionTitle}>Libreria Esercizi</Text>
      <Card style={styles.card} onPress={() => {}}>
        <View style={styles.libraryRow}>
          <View>
            <Text style={styles.libraryTitle}>Esplora Libreria</Text>
            <Text style={styles.librarySubtitle}>156 esercizi disponibili</Text>
          </View>
          <Text style={styles.libraryArrow}>→</Text>
        </View>
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
  addButtonContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  programmaNome: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.collaboratore,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  detailValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  assegnatoContainer: {
    padding: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  assegnatoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  assegnatoNomi: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  libraryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  librarySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  libraryArrow: {
    fontSize: 24,
    color: COLORS.collaboratore,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
