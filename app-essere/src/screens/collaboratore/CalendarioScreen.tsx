import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const CalendarioScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const giorni = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

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

  const eventi = [
    { id: '1', ora: '09:00', allievo: 'Marco Bianchi', tipo: 'Allenamento', durata: 60 },
    { id: '2', ora: '10:30', allievo: 'Anna Verdi', tipo: 'Valutazione', durata: 45 },
    { id: '3', ora: '14:00', allievo: 'Giulia Rossi', tipo: 'Allenamento', durata: 60 },
    { id: '4', ora: '16:00', allievo: 'Paolo Neri', tipo: 'Allenamento', durata: 60 },
  ];

  return (
    <View style={styles.container}>
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

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button title="+ Aggiungi Sessione" onPress={() => {}} variant="primary" fullWidth />
      </View>

      {/* Eventi del giorno */}
      <ScrollView style={styles.eventiContainer}>
        <Text style={styles.eventiTitle}>
          {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {eventi.map((evento) => (
          <Card key={evento.id} style={styles.eventoCard} onPress={() => {}}>
            <View style={styles.eventoRow}>
              <View style={styles.eventoTime}>
                <Text style={styles.eventoOra}>{evento.ora}</Text>
                <Text style={styles.eventoDurata}>{evento.durata} min</Text>
              </View>
              <View style={styles.eventoContent}>
                <Text style={styles.eventoAllievo}>{evento.allievo}</Text>
                <Text style={styles.eventoTipo}>{evento.tipo}</Text>
              </View>
            </View>
          </Card>
        ))}

        {eventi.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nessuna sessione programmata</Text>
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
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.collaboratore,
  },
  dayNumberText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  dayNumberTextToday: {
    color: COLORS.white,
  },
  addButtonContainer: {
    padding: SPACING.md,
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
  eventoTime: {
    backgroundColor: COLORS.collaboratore,
    padding: SPACING.sm,
    borderRadius: BORDERS.radiusMedium,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  eventoOra: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  eventoDurata: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.8,
  },
  eventoContent: {
    flex: 1,
  },
  eventoAllievo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  eventoTipo: {
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
