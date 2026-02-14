// App ESSĒRE - Allievo Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card, Button } from '../../components/common';
import { getUserById, getCollaboratoreById, getAllieviByIds } from '../../services/userService';
import { getSessioniByAllievo } from '../../services/sessionService';
import { getPagamentiByAllievo } from '../../services/paymentService';
import { User, Allievo, Collaboratore, Sessione, Pagamento } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface AllievoDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

export const AllievoDetailScreen: React.FC<AllievoDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [allievo, setAllievo] = useState<User | null>(null);
  const [allievoData, setAllievoData] = useState<Allievo | null>(null);
  const [collaboratore, setCollaboratore] = useState<User | null>(null);
  const [sessioni, setSessioni] = useState<Sessione[]>([]);
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Carica info utente allievo
      const userData = await getUserById(id);
      setAllievo(userData);

      // Carica sessioni e pagamenti
      const [sessioniData, pagamentiData] = await Promise.all([
        getSessioniByAllievo(id),
        getPagamentiByAllievo(id),
      ]);

      setSessioni(sessioniData);
      setPagamenti(pagamentiData);
    } catch (error) {
      console.error('Errore caricamento dati allievo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessioniStats = () => {
    const completate = sessioni.filter((s) => s.stato === 'completata').length;
    const programmate = sessioni.filter((s) => s.stato === 'programmata').length;
    const annullate = sessioni.filter((s) => s.stato === 'annullata').length;

    return { completate, programmate, annullate };
  };

  const getPagamentiStats = () => {
    const totale = pagamenti.reduce((sum, p) => sum + p.importoTotale, 0);
    const pagato = pagamenti.reduce((sum, p) => {
      return sum + p.rate.filter((r) => r.pagata).reduce((s, r) => s + r.importo, 0);
    }, 0);
    const daIncassare = totale - pagato;

    return { totale, pagato, daIncassare };
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  if (!allievo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Allievo non trovato</Text>
      </View>
    );
  }

  const sessioniStats = getSessioniStats();
  const pagamentiStats = getPagamentiStats();

  const iniziali = `${allievo.nome.charAt(0)}${allievo.cognome.charAt(0)}`;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniziali}</Text>
        </View>
        <Text style={styles.nome}>{allievo.nome} {allievo.cognome}</Text>
        <Text style={styles.email}>{allievo.email}</Text>
        {allievo.telefono && (
          <Text style={styles.telefono}>{allievo.telefono}</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('NuovaSessione', { allievoId: id })}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionLabel}>Sessione</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Chat', { partecipanteId: id })}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>Messaggio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('TestPosturale', { allievoId: id })}
        >
          <Text style={styles.actionIcon}>🧍</Text>
          <Text style={styles.actionLabel}>Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('NuovoPagamento', { allievoId: id })}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionLabel}>Pagamento</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiche Sessioni */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Sessioni</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {sessioniStats.completate}
            </Text>
            <Text style={styles.statLabel}>Completate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {sessioniStats.programmate}
            </Text>
            <Text style={styles.statLabel}>Programmate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {sessioniStats.annullate}
            </Text>
            <Text style={styles.statLabel}>Annullate</Text>
          </View>
        </View>
      </Card>

      {/* Statistiche Pagamenti */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pagamenti</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>
              €{pagamentiStats.totale}
            </Text>
            <Text style={styles.statLabel}>Totale</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              €{pagamentiStats.pagato}
            </Text>
            <Text style={styles.statLabel}>Incassato</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              €{pagamentiStats.daIncassare}
            </Text>
            <Text style={styles.statLabel}>Da incassare</Text>
          </View>
        </View>
      </Card>

      {/* Prossime sessioni */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prossime sessioni</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
            <Text style={styles.seeAll}>Vedi tutte</Text>
          </TouchableOpacity>
        </View>

        {sessioni.filter((s) => s.stato === 'programmata').length === 0 ? (
          <Text style={styles.emptyText}>Nessuna sessione programmata</Text>
        ) : (
          sessioni
            .filter((s) => s.stato === 'programmata')
            .slice(0, 3)
            .map((sessione) => (
              <TouchableOpacity
                key={sessione.id}
                style={styles.sessioneItem}
                onPress={() =>
                  navigation.navigate('SessioneDetail', { id: sessione.id })
                }
              >
                <View style={styles.sessioneDate}>
                  <Text style={styles.sessioneDateDay}>
                    {sessione.data.getDate()}
                  </Text>
                  <Text style={styles.sessioneDateMonth}>
                    {sessione.data.toLocaleDateString('it-IT', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.sessioneInfo}>
                  <Text style={styles.sessioneTime}>
                    {sessione.data.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.sessioneTipo}>{sessione.tipo}</Text>
                </View>
              </TouchableOpacity>
            ))
        )}
      </Card>

      {/* Info aggiuntive */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membro dal</Text>
          <Text style={styles.infoValue}>
            {allievo.createdAt.toLocaleDateString('it-IT')}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.allievo,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  nome: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
  },
  telefono: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
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
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sessioneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessioneDate: {
    width: 50,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sessioneDateDay: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sessioneDateMonth: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  sessioneInfo: {
    flex: 1,
  },
  sessioneTime: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sessioneTipo: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
});

export default AllievoDetailScreen;
