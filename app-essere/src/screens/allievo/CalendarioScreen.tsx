import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

  // Mock sessioni
  const sessioni = [
    {
      id: '1',
      data: new Date(),
      ora: '14:00',
      collaboratore: 'Luca',
      tipo: 'Allenamento',
      stato: 'programmata',
      annullabile: true, // più di 10 ore
    },
    {
      id: '2',
      data: new Date(Date.now() + 86400000),
      ora: '10:00',
      collaboratore: 'Luca',
      tipo: 'Valutazione',
      stato: 'programmata',
      annullabile: true,
    },
  ];

  const sessioniGiorno = sessioni.filter(
    s => s.data.toDateString() === selectedDate.toDateString()
  );

  const handleAnnulla = (sessioneId: string) => {
    Alert.alert(
      'Annulla Sessione',
      'Sei sicuro di voler annullare questa sessione?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sì, annulla', style: 'destructive', onPress: () => console.log('Annullata') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Week Header */}
      <View style={styles.weekHeader}>
        {settimana.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const hasSession = sessioni.some(s => s.data.toDateString() === date.toDateString());

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
              {hasSession && <View style={styles.sessionDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sessioni del giorno */}
      <ScrollView style={styles.sessioniContainer}>
        <Text style={styles.sessioniTitle}>
          {selectedDate.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>

        {sessioniGiorno.map((sessione) => (
          <Card key={sessione.id} style={styles.sessioneCard}>
            <View style={styles.sessioneHeader}>
              <View style={styles.sessioneOraContainer}>
                <Text style={styles.sessioneOra}>{sessione.ora}</Text>
              </View>
              <View style={styles.sessioneInfo}>
                <Text style={styles.sessioneTipo}>{sessione.tipo}</Text>
                <Text style={styles.sessioneCollab}>con {sessione.collaboratore}</Text>
              </View>
              <View style={styles.sessioneStato}>
                <Text style={styles.sessioneStatoText}>
                  {sessione.stato === 'programmata' ? '📅' : '✅'}
                </Text>
              </View>
            </View>

            {sessione.annullabile && sessione.stato === 'programmata' && (
              <View style={styles.sessioneActions}>
                <Button
                  title="Annulla Sessione"
                  onPress={() => handleAnnulla(sessione.id)}
                  variant="danger"
                  size="small"
                />
              </View>
            )}

            {!sessione.annullabile && sessione.stato === 'programmata' && (
              <Text style={styles.nonAnnullabile}>
                Non annullabile (meno di 10 ore)
              </Text>
            )}
          </Card>
        ))}

        {sessioniGiorno.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateText}>Nessuna sessione programmata</Text>
          </View>
        )}

        {/* Richiedi sessione */}
        <Card style={styles.richiestaCard}>
          <Text style={styles.richiestaTitle}>Vuoi prenotare una sessione?</Text>
          <Text style={styles.richiestaSubtitle}>
            Contatta il tuo coach per programmare nuove sessioni
          </Text>
          <Button title="Contatta Coach" onPress={() => {}} variant="outline" />
        </Card>
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
    backgroundColor: COLORS.allievo,
  },
  dayNumberText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  dayNumberTextToday: {
    color: COLORS.white,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: SPACING.xs,
  },
  sessioniContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  sessioniTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },
  sessioneCard: {
    marginBottom: SPACING.md,
  },
  sessioneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessioneOraContainer: {
    backgroundColor: COLORS.allievo,
    padding: SPACING.sm,
    borderRadius: BORDERS.radiusMedium,
    marginRight: SPACING.md,
  },
  sessioneOra: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sessioneInfo: {
    flex: 1,
  },
  sessioneTipo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  sessioneCollab: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sessioneStato: {},
  sessioneStatoText: {
    fontSize: 24,
  },
  sessioneActions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
  nonAnnullabile: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  richiestaCard: {
    marginTop: SPACING.lg,
  },
  richiestaTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: SPACING.xs,
  },
  richiestaSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
});
