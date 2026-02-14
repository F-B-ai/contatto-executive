import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const CalendarioScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'giorno' | 'settimana' | 'mese'>('settimana');

  // Mock eventi
  const eventi = [
    { id: '1', ora: '09:00', titolo: 'Marco Bianchi', collaboratore: 'Luca', colore: COLORS.collaboratore },
    { id: '2', ora: '10:30', titolo: 'Anna Verdi', collaboratore: 'Sara', colore: COLORS.allievo },
    { id: '3', ora: '14:00', titolo: 'Paolo Neri', collaboratore: 'Tu', colore: COLORS.titolare },
    { id: '4', ora: '16:00', titolo: 'Maria Rossi', collaboratore: 'Luca', colore: COLORS.collaboratore },
  ];

  const giorni = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Genera settimana corrente
  const getSettimana = () => {
    const oggi = new Date();
    const giornoSettimana = oggi.getDay();
    const diff = oggi.getDate() - giornoSettimana + (giornoSettimana === 0 ? -6 : 1);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(oggi);
      date.setDate(diff + i);
      return date;
    });
  };

  const settimana = getSettimana();

  return (
    <View style={styles.container}>
      {/* View Mode Selector */}
      <View style={styles.viewModeContainer}>
        {(['giorno', 'settimana', 'mese'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Week Header */}
      <View style={styles.weekHeader}>
        {settimana.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayColumn,
                isSelected && styles.dayColumnSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dayName}>{giorni[index]}</Text>
              <View style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                <Text style={[styles.dayNumberText, isToday && styles.dayNumberTextToday]}>
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter by collaboratore */}
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Tutti</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Luca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Sara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Tu</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Eventi del giorno */}
      <ScrollView style={styles.eventiContainer}>
        <Text style={styles.eventiTitle}>
          {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {eventi.map((evento) => (
          <Card key={evento.id} style={styles.eventoCard} onPress={() => {}}>
            <View style={styles.eventoRow}>
              <View style={[styles.eventoIndicator, { backgroundColor: evento.colore }]} />
              <View style={styles.eventoContent}>
                <Text style={styles.eventoOra}>{evento.ora}</Text>
                <Text style={styles.eventoTitolo}>{evento.titolo}</Text>
                <Text style={styles.eventoCollab}>con {evento.collaboratore}</Text>
              </View>
            </View>
          </Card>
        ))}

        {eventi.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nessun evento per questa data</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  viewModeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusMedium,
    backgroundColor: COLORS.gray200,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.titolare,
  },
  viewModeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  viewModeTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.xs,
  },
  dayColumnSelected: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDERS.radiusMedium,
  },
  dayName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  dayNumberToday: {
    backgroundColor: COLORS.accent,
  },
  dayNumberText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  dayNumberTextToday: {
    color: COLORS.white,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusFull,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  eventiContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  eventiTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },
  eventoCard: {
    marginBottom: SPACING.sm,
  },
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventoIndicator: {
    width: 4,
    height: '100%',
    minHeight: 50,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  eventoContent: {
    flex: 1,
  },
  eventoOra: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  eventoTitolo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  eventoCollab: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
