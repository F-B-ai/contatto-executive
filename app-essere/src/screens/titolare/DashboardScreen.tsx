// App ESSĒRE - Titolare Dashboard Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

export const DashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  // Dati mock per demo
  const stats = {
    sessioni_oggi: 5,
    allievi_totali: 24,
    collaboratori: 3,
    entrate_mese: 4850,
  };

  const StatCard = ({
    title,
    value,
    color
  }: {
    title: string;
    value: string | number;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ciao, {user?.nome}!</Text>
          <Text style={styles.role}>Titolare</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Sessioni oggi"
          value={stats.sessioni_oggi}
          color={COLORS.primary}
        />
        <StatCard
          title="Allievi totali"
          value={stats.allievi_totali}
          color={COLORS.success}
        />
        <StatCard
          title="Collaboratori"
          value={stats.collaboratori}
          color={COLORS.secondary}
        />
        <StatCard
          title="Entrate mese"
          value={`€${stats.entrate_mese}`}
          color={COLORS.info}
        />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Prossime Sessioni</Text>
        <View style={styles.sessionItem}>
          <View style={[styles.sessionDot, { backgroundColor: COLORS.calendar[0] }]} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTime}>09:00 - 10:00</Text>
            <Text style={styles.sessionName}>Mario Rossi</Text>
            <Text style={styles.sessionCoach}>con Marco Bianchi</Text>
          </View>
        </View>
        <View style={styles.sessionItem}>
          <View style={[styles.sessionDot, { backgroundColor: COLORS.calendar[1] }]} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTime}>11:00 - 12:00</Text>
            <Text style={styles.sessionName}>Giulia Verdi</Text>
            <Text style={styles.sessionCoach}>con Anna Neri</Text>
          </View>
        </View>
        <View style={styles.sessionItem}>
          <View style={[styles.sessionDot, { backgroundColor: COLORS.calendar[0] }]} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTime}>14:30 - 15:30</Text>
            <Text style={styles.sessionName}>Luca Gialli</Text>
            <Text style={styles.sessionCoach}>con Marco Bianchi</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pagamenti in Scadenza</Text>
        <View style={styles.paymentItem}>
          <View>
            <Text style={styles.paymentName}>Mario Rossi</Text>
            <Text style={styles.paymentDate}>Scade: 15 Feb 2026</Text>
          </View>
          <Text style={styles.paymentAmount}>€150</Text>
        </View>
        <View style={styles.paymentItem}>
          <View>
            <Text style={styles.paymentName}>Giulia Verdi</Text>
            <Text style={styles.paymentDate}>Scade: 18 Feb 2026</Text>
          </View>
          <Text style={styles.paymentAmount}>€200</Text>
        </View>
      </Card>

      <Button
        title="Logout"
        onPress={signOut}
        variant="outline"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  role: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  sessionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sessionCoach: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  paymentDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
  },
  paymentAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
});

export default DashboardScreen;
