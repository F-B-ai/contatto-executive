// App ESSĒRE - Allievo Home Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ciao, {user?.nome}!</Text>
          <Text style={styles.subtitle}>Continua il tuo percorso</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prossima sessione */}
      <Card style={styles.nextSessionCard}>
        <Text style={styles.nextSessionLabel}>PROSSIMA SESSIONE</Text>
        <Text style={styles.nextSessionDate}>Lunedì 17 Febbraio</Text>
        <Text style={styles.nextSessionTime}>10:00 - 11:00</Text>
        <View style={styles.nextSessionCoach}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachInitials}>MB</Text>
          </View>
          <View>
            <Text style={styles.coachName}>Marco Bianchi</Text>
            <Text style={styles.coachRole}>Il tuo coach</Text>
          </View>
        </View>
        <Button
          title="Vedi dettagli"
          variant="secondary"
          size="sm"
          style={styles.detailsButton}
          onPress={() => {}}
        />
      </Card>

      {/* Programma di oggi */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Il tuo allenamento di oggi</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Vedi tutto →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseList}>
          {[
            { nome: 'Squat', serie: '4x12', completato: true },
            { nome: 'Affondi', serie: '3x10', completato: true },
            { nome: 'Leg Press', serie: '4x15', completato: false },
            { nome: 'Calf Raises', serie: '3x20', completato: false },
          ].map((ex, i) => (
            <View key={i} style={styles.exerciseItem}>
              <View style={[styles.checkbox, ex.completato && styles.checkboxDone]}>
                {ex.completato && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, ex.completato && styles.exerciseDone]}>
                  {ex.nome}
                </Text>
                <Text style={styles.exerciseSerie}>{ex.serie}</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>2 di 4 esercizi completati</Text>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Sessioni</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statEmoji}>📈</Text>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Presenza</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Settimane</Text>
        </Card>
      </View>

      {/* Contenuti */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nuovi contenuti per te</Text>
        </View>
        <TouchableOpacity style={styles.contentItem}>
          <View style={[styles.contentIcon, { backgroundColor: COLORS.info + '20' }]}>
            <Text>🎧</Text>
          </View>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>Mindset e Performance</Text>
            <Text style={styles.contentType}>Podcast • 25 min</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contentItem}>
          <View style={[styles.contentIcon, { backgroundColor: COLORS.error + '20' }]}>
            <Text>📹</Text>
          </View>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>Tecnica Squat Perfetta</Text>
            <Text style={styles.contentType}>Video • 12 min</Text>
          </View>
        </TouchableOpacity>
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
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  nextSessionCard: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  nextSessionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white + '80',
    fontWeight: '600',
    letterSpacing: 1,
  },
  nextSessionDate: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  nextSessionTime: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
  },
  nextSessionCoach: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '20',
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  coachInitials: {
    color: COLORS.white,
    fontWeight: '600',
  },
  coachName: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.md,
  },
  coachRole: {
    color: COLORS.white + '80',
    fontSize: FONT_SIZE.sm,
  },
  detailsButton: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  exerciseList: {
    gap: SPACING.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  exerciseDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  exerciseSerie: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: COLORS.primary,
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  contentType: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
});

export default HomeScreen;
