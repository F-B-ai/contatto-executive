import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const AllieviScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollaboratore, setFilterCollaboratore] = useState<string | null>(null);

  // Mock data
  const allievi = [
    {
      id: '1',
      nome: 'Marco Bianchi',
      collaboratore: 'Luca',
      dataInizio: '15/01/2026',
      sessioniCompletate: 24,
      prossimaSessione: 'Oggi, 09:00',
      statoAbbonamento: 'attivo',
    },
    {
      id: '2',
      nome: 'Anna Verdi',
      collaboratore: 'Sara',
      dataInizio: '01/02/2026',
      sessioniCompletate: 12,
      prossimaSessione: 'Domani, 10:30',
      statoAbbonamento: 'attivo',
    },
    {
      id: '3',
      nome: 'Paolo Neri',
      collaboratore: 'Tu',
      dataInizio: '10/12/2025',
      sessioniCompletate: 48,
      prossimaSessione: 'Oggi, 14:00',
      statoAbbonamento: 'scadenza',
    },
    {
      id: '4',
      nome: 'Giulia Rossi',
      collaboratore: 'Luca',
      dataInizio: '20/01/2026',
      sessioniCompletate: 8,
      prossimaSessione: 'Ven, 16:00',
      statoAbbonamento: 'attivo',
    },
  ];

  const collaboratori = ['Tutti', 'Luca', 'Sara', 'Tu'];

  const filteredAllievi = allievi.filter((allievo) => {
    const matchesSearch = allievo.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollab = !filterCollaboratore || filterCollaboratore === 'Tutti' ||
                          allievo.collaboratore === filterCollaboratore;
    return matchesSearch && matchesCollab;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca allievo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        {collaboratori.map((collab) => (
          <TouchableOpacity
            key={collab}
            style={[
              styles.filterChip,
              (filterCollaboratore === collab || (!filterCollaboratore && collab === 'Tutti')) &&
                styles.filterChipActive,
            ]}
            onPress={() => setFilterCollaboratore(collab === 'Tutti' ? null : collab)}
          >
            <Text
              style={[
                styles.filterChipText,
                (filterCollaboratore === collab || (!filterCollaboratore && collab === 'Tutti')) &&
                  styles.filterChipTextActive,
              ]}
            >
              {collab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button title="+ Nuovo Allievo" onPress={() => {}} variant="primary" fullWidth />
      </View>

      {/* Lista Allievi */}
      <ScrollView style={styles.listContainer}>
        {filteredAllievi.map((allievo) => (
          <Card key={allievo.id} style={styles.card} onPress={() => {}}>
            <View style={styles.cardHeader}>
              <Avatar name={allievo.nome} size="medium" backgroundColor={COLORS.allievo} />
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.nome}>{allievo.nome}</Text>
                <Text style={styles.collaboratore}>Seguito da {allievo.collaboratore}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  allievo.statoAbbonamento === 'scadenza' && styles.statusBadgeWarning,
                ]}
              >
                <Text style={styles.statusText}>
                  {allievo.statoAbbonamento === 'attivo' ? 'Attivo' : 'In scadenza'}
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Inizio</Text>
                <Text style={styles.detailValue}>{allievo.dataInizio}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sessioni</Text>
                <Text style={styles.detailValue}>{allievo.sessioniCompletate}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Prossima</Text>
                <Text style={styles.detailValue}>{allievo.prossimaSessione}</Text>
              </View>
            </View>
          </Card>
        ))}

        {filteredAllievi.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nessun allievo trovato</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radiusMedium,
    ...TYPOGRAPHY.body,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusFull,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.titolare,
  },
  filterChipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  addButtonContainer: {
    padding: SPACING.md,
  },
  listContainer: {
    flex: 1,
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
  collaboratore: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusBadgeWarning: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
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
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
