import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Avatar, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const ProfiloScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // Mock data
  const profilo = {
    dataInizio: '15 Gennaio 2026',
    coach: 'Luca Verdi',
    obiettivo: 'Forza e massa muscolare',
    sessioni: 24,
    settimane: 8,
  };

  const abbonamento = {
    tipo: '10 Sessioni',
    rimanenti: 6,
    scadenza: '15 Marzo 2026',
  };

  const handleLogout = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Profilo */}
      <View style={styles.header}>
        <Avatar
          name={`${user?.nome} ${user?.cognome}`}
          size="large"
          backgroundColor={COLORS.allievo}
        />
        <Text style={styles.nome}>{user?.nome} {user?.cognome}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.membro}>Membro dal {profilo.dataInizio}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profilo.sessioni}</Text>
          <Text style={styles.statLabel}>Sessioni</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profilo.settimane}</Text>
          <Text style={styles.statLabel}>Settimane</Text>
        </View>
      </View>

      {/* Il Mio Coach */}
      <Card title="Il Mio Coach" style={styles.card}>
        <View style={styles.coachRow}>
          <Avatar name={profilo.coach} backgroundColor={COLORS.collaboratore} />
          <View style={styles.coachInfo}>
            <Text style={styles.coachNome}>{profilo.coach}</Text>
            <Text style={styles.coachObiettivo}>Obiettivo: {profilo.obiettivo}</Text>
          </View>
          <Button title="Chat" onPress={() => {}} variant="outline" size="small" />
        </View>
      </Card>

      {/* Abbonamento */}
      <Card title="Il Mio Abbonamento" style={styles.card}>
        <View style={styles.abbonamentoRow}>
          <View>
            <Text style={styles.abbonamentoTipo}>{abbonamento.tipo}</Text>
            <Text style={styles.abbonamentoScadenza}>Scade: {abbonamento.scadenza}</Text>
          </View>
          <View style={styles.abbonamentoRimanenti}>
            <Text style={styles.rimanentiValue}>{abbonamento.rimanenti}</Text>
            <Text style={styles.rimanentiLabel}>rimaste</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(abbonamento.rimanenti / 10) * 100}%` },
            ]}
          />
        </View>
      </Card>

      {/* Menu Profilo */}
      <Card title="Impostazioni" style={styles.card}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📝</Text>
          <Text style={styles.menuLabel}>Modifica Profilo</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📔</Text>
          <Text style={styles.menuLabel}>Il Mio Diario</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuLabel}>Test Posturali</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuLabel}>Pagamenti</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuLabel}>Notifiche</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuLabel}>Supporto</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button title="Esci" onPress={handleLogout} variant="danger" fullWidth />
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
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  nome: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  email: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  membro: {
    ...TYPOGRAPHY.caption,
    color: COLORS.allievo,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.allievo,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  card: {
    margin: SPACING.md,
    marginBottom: 0,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  coachNome: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  coachObiettivo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  abbonamentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  abbonamentoTipo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  abbonamentoScadenza: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  abbonamentoRimanenti: {
    alignItems: 'center',
  },
  rimanentiValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.allievo,
  },
  rimanentiLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.allievo,
    borderRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuLabel: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  menuArrow: {
    fontSize: 18,
    color: COLORS.gray400,
  },
  logoutContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
