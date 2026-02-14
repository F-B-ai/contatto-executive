import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // Mock data
  const prossimaSessione = {
    data: 'Oggi',
    ora: '14:00',
    collaboratore: 'Luca',
    tipo: 'Allenamento',
  };

  const stats = {
    sessioniCompletate: 24,
    settimaneAttive: 8,
    prossimoObiettivo: '30 sessioni',
  };

  const programmaOggi = [
    { id: '1', nome: 'Squat', serie: '4x12', completato: true },
    { id: '2', nome: 'Leg Press', serie: '3x15', completato: true },
    { id: '3', nome: 'Affondi', serie: '3x10', completato: false },
    { id: '4', nome: 'Leg Curl', serie: '3x12', completato: false },
  ];

  const contenutiNuovi = [
    { id: '1', tipo: 'video', titolo: 'Tecnica Squat' },
    { id: '2', tipo: 'podcast', titolo: 'Mindset e Allenamento' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Ciao, {user?.nome}!</Text>
          <Text style={styles.motivational}>Continua così!</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Avatar name={`${user?.nome} ${user?.cognome}`} backgroundColor={COLORS.allievo} />
        </TouchableOpacity>
      </View>

      {/* Prossima Sessione */}
      <Card style={[styles.card, styles.sessioneCard]}>
        <Text style={styles.sessioneLabel}>Prossima Sessione</Text>
        <View style={styles.sessioneContent}>
          <View>
            <Text style={styles.sessioneData}>{prossimaSessione.data}, {prossimaSessione.ora}</Text>
            <Text style={styles.sessioneTipo}>{prossimaSessione.tipo} con {prossimaSessione.collaboratore}</Text>
          </View>
          <View style={styles.sessioneCountdown}>
            <Text style={styles.countdownText}>2h</Text>
          </View>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.sessioniCompletate}</Text>
          <Text style={styles.statLabel}>Sessioni</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.settimaneAttive}</Text>
          <Text style={styles.statLabel}>Settimane</Text>
        </Card>
      </View>

      {/* Programma Oggi */}
      <Card title="Il Tuo Programma Oggi" style={styles.card}>
        {programmaOggi.map((esercizio) => (
          <View key={esercizio.id} style={styles.esercizioRow}>
            <View style={[styles.checkbox, esercizio.completato && styles.checkboxCompleted]}>
              {esercizio.completato && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.esercizioInfo}>
              <Text style={[styles.esercizioNome, esercizio.completato && styles.esercizioCompletato]}>
                {esercizio.nome}
              </Text>
              <Text style={styles.esercizioSerie}>{esercizio.serie}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Contenuti Nuovi */}
      <Card title="Contenuti Per Te" style={styles.card}>
        {contenutiNuovi.map((contenuto) => (
          <TouchableOpacity key={contenuto.id} style={styles.contenutoRow}>
            <View style={styles.contenutoIcon}>
              <Text>{contenuto.tipo === 'video' ? '🎬' : '🎧'}</Text>
            </View>
            <Text style={styles.contenutoTitolo}>{contenuto.titolo}</Text>
            <Text style={styles.contenutoArrow}>→</Text>
          </TouchableOpacity>
        ))}
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
  motivational: {
    ...TYPOGRAPHY.body,
    color: COLORS.allievo,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sessioneCard: {
    backgroundColor: COLORS.allievo,
  },
  sessioneLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  sessioneContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessioneData: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  sessioneTipo: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  sessioneCountdown: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.allievo,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  esercizioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  esercizioInfo: {
    flex: 1,
  },
  esercizioNome: {
    ...TYPOGRAPHY.body,
  },
  esercizioCompletato: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  esercizioSerie: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  contenutoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  contenutoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contenutoTitolo: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  contenutoArrow: {
    fontSize: 20,
    color: COLORS.gray400,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
