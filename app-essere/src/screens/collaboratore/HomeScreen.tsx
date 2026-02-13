// App ESSĒRE - Collaboratore Home Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  // Dati mock
  const stats = {
    allievi: 8,
    sessioni_oggi: 3,
    guadagno_mese: 1800,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ciao, {user?.nome}!</Text>
          <Text style={styles.role}>Coach</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderTopColor: COLORS.collaboratore }]}>
          <Text style={styles.statValue}>{stats.allievi}</Text>
          <Text style={styles.statTitle}>I miei allievi</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: COLORS.primary }]}>
          <Text style={styles.statValue}>{stats.sessioni_oggi}</Text>
          <Text style={styles.statTitle}>Sessioni oggi</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: COLORS.secondary }]}>
          <Text style={styles.statValue}>€{stats.guadagno_mese}</Text>
          <Text style={styles.statTitle}>Questo mese</Text>
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Le mie sessioni di oggi</Text>
        <View style={styles.sessionItem}>
          <View style={styles.sessionTime}>
            <Text style={styles.timeText}>09:00</Text>
            <Text style={styles.timeSubtext}>10:00</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Mario Rossi</Text>
            <Text style={styles.sessionType}>Allenamento</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
            <Text style={[styles.statusText, { color: COLORS.success }]}>Confermata</Text>
          </View>
        </View>
        <View style={styles.sessionItem}>
          <View style={styles.sessionTime}>
            <Text style={styles.timeText}>11:30</Text>
            <Text style={styles.timeSubtext}>12:30</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Laura Bianchi</Text>
            <Text style={styles.sessionType}>Valutazione</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.info + '20' }]}>
            <Text style={[styles.statusText, { color: COLORS.info }]}>In attesa</Text>
          </View>
        </View>
        <View style={styles.sessionItem}>
          <View style={styles.sessionTime}>
            <Text style={styles.timeText}>15:00</Text>
            <Text style={styles.timeSubtext}>16:00</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Paolo Verdi</Text>
            <Text style={styles.sessionType}>Allenamento</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
            <Text style={[styles.statusText, { color: COLORS.success }]}>Confermata</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>I miei allievi</Text>
        {['Mario Rossi', 'Laura Bianchi', 'Paolo Verdi', 'Giulia Neri'].map((name, i) => (
          <TouchableOpacity key={i} style={styles.allievoItem}>
            <View style={styles.allievoAvatar}>
              <Text style={styles.allievoInitials}>
                {name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.allievoInfo}>
              <Text style={styles.allievoName}>{name}</Text>
              <Text style={styles.allievoSessions}>12 sessioni completate</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
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
    color: COLORS.collaboratore,
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.collaboratore,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderTopWidth: 3,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  sessionTime: {
    width: 50,
    marginRight: SPACING.md,
  },
  timeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timeSubtext: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  sessionType: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  allievoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  allievoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  allievoInitials: {
    color: COLORS.white,
    fontWeight: '600',
  },
  allievoInfo: {
    flex: 1,
  },
  allievoName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  allievoSessions: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textDisabled,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
});

export default HomeScreen;
