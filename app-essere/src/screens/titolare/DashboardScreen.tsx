import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // Dati mock per la dashboard
  const stats = {
    sessioniOggi: 8,
    collaboratoriAttivi: 3,
    allieviTotali: 25,
    entrateDelMese: 4500,
    usciteDelMese: 1200,
  };

  const prossimiAppuntamenti = [
    { id: '1', allievo: 'Marco Bianchi', ora: '09:00', collaboratore: 'Luca' },
    { id: '2', allievo: 'Anna Verdi', ora: '10:30', collaboratore: 'Sara' },
    { id: '3', allievo: 'Paolo Neri', ora: '14:00', collaboratore: 'Tu' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header con saluto */}
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
          <Avatar name={`${user?.nome} ${user?.cognome}`} backgroundColor={COLORS.titolare} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: COLORS.titolare }]}>
          <Text style={styles.statNumber}>{stats.sessioniOggi}</Text>
          <Text style={styles.statLabel}>Sessioni Oggi</Text>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: COLORS.collaboratore }]}>
          <Text style={styles.statNumber}>{stats.collaboratoriAttivi}</Text>
          <Text style={styles.statLabel}>Collaboratori</Text>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: COLORS.allievo }]}>
          <Text style={styles.statNumber}>{stats.allieviTotali}</Text>
          <Text style={styles.statLabel}>Allievi Totali</Text>
        </Card>
      </View>

      {/* Riepilogo Economico */}
      <Card title="Riepilogo Economico" style={styles.card}>
        <View style={styles.economicRow}>
          <View style={styles.economicItem}>
            <Text style={styles.economicLabel}>Entrate</Text>
            <Text style={[styles.economicValue, { color: COLORS.success }]}>
              +{stats.entrateDelMese.toLocaleString()}
            </Text>
          </View>
          <View style={styles.economicItem}>
            <Text style={styles.economicLabel}>Uscite</Text>
            <Text style={[styles.economicValue, { color: COLORS.error }]}>
              -{stats.usciteDelMese.toLocaleString()}
            </Text>
          </View>
          <View style={styles.economicItem}>
            <Text style={styles.economicLabel}>Profitto</Text>
            <Text style={[styles.economicValue, { color: COLORS.primary }]}>
              {(stats.entrateDelMese - stats.usciteDelMese).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>

      {/* Prossimi Appuntamenti */}
      <Card title="Prossimi Appuntamenti" style={styles.card}>
        {prossimiAppuntamenti.map((app) => (
          <View key={app.id} style={styles.appointmentRow}>
            <View style={styles.appointmentTime}>
              <Text style={styles.appointmentTimeText}>{app.ora}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentName}>{app.allievo}</Text>
              <Text style={styles.appointmentCollab}>con {app.collaboratore}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button title="+ Nuova Sessione" onPress={() => {}} variant="primary" />
        <Button title="+ Nuovo Allievo" onPress={() => {}} variant="outline" />
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
  economicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  economicItem: {
    alignItems: 'center',
  },
  economicLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  economicValue: {
    ...TYPOGRAPHY.h3,
    marginTop: SPACING.xs,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  appointmentTime: {
    backgroundColor: COLORS.primary,
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
  appointmentCollab: {
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
