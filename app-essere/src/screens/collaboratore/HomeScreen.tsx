import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // Mock data
  const stats = {
    sessioniOggi: 5,
    allieviAttivi: 8,
    guadagnoMese: 1920,
    sessioniMese: 32,
  };

  const prossimiAppuntamenti = [
    { id: '1', allievo: 'Marco Bianchi', ora: '09:00', tipo: 'Allenamento' },
    { id: '2', allievo: 'Anna Verdi', ora: '10:30', tipo: 'Valutazione' },
    { id: '3', allievo: 'Giulia Rossi', ora: '14:00', tipo: 'Allenamento' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Ciao, {user?.nome}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Avatar name={`${user?.nome} ${user?.cognome}`} backgroundColor={COLORS.collaboratore} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: COLORS.collaboratore }]}>
          <Text style={styles.statNumber}>{stats.sessioniOggi}</Text>
          <Text style={styles.statLabel}>Sessioni Oggi</Text>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: COLORS.allievo }]}>
          <Text style={styles.statNumber}>{stats.allieviAttivi}</Text>
          <Text style={styles.statLabel}>I Miei Allievi</Text>
        </Card>
      </View>

      {/* Guadagno del mese */}
      <Card title="Il Mio Guadagno" style={styles.card}>
        <View style={styles.guadagnoContainer}>
          <View style={styles.guadagnoItem}>
            <Text style={styles.guadagnoLabel}>Questo mese</Text>
            <Text style={styles.guadagnoValue}>{stats.guadagnoMese}</Text>
          </View>
          <View style={styles.guadagnoItem}>
            <Text style={styles.guadagnoLabel}>Sessioni</Text>
            <Text style={styles.guadagnoValue}>{stats.sessioniMese}</Text>
          </View>
        </View>
      </Card>

      {/* Prossimi Appuntamenti */}
      <Card title="Oggi" style={styles.card}>
        {prossimiAppuntamenti.map((app) => (
          <View key={app.id} style={styles.appointmentRow}>
            <View style={styles.appointmentTime}>
              <Text style={styles.appointmentTimeText}>{app.ora}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentName}>{app.allievo}</Text>
              <Text style={styles.appointmentType}>{app.tipo}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button title="+ Nuova Sessione" onPress={() => {}} variant="primary" />
        <Button title="Crea Programma" onPress={() => {}} variant="outline" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  headerLeft: {},
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  date: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statNumber: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  card: {
    margin: SPACING.lg,
    marginTop: SPACING.md,
  },
  guadagnoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  guadagnoItem: {
    alignItems: 'center',
  },
  guadagnoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  guadagnoValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.success,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  appointmentTime: {
    backgroundColor: COLORS.collaboratore,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  appointmentTimeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  appointmentType: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
