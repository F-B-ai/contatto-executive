// App ESSĒRE - Sessione Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, Button, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Sessione, User, Esercizio } from '../../types';
import { getSessione, completaSessione, annullaSessione } from '../../services/sessionService';
import { getUser } from '../../services/userService';
import { getEsercizio } from '../../services/programService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

interface SessioneDetailScreenProps {
  sessioneId: string;
  onBack?: () => void;
  onSessioneUpdated?: () => void;
}

export const SessioneDetailScreen: React.FC<SessioneDetailScreenProps> = ({
  sessioneId,
  onBack,
  onSessioneUpdated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessione, setSessione] = useState<Sessione | null>(null);
  const [allievo, setAllievo] = useState<User | null>(null);
  const [collaboratore, setCollaboratore] = useState<User | null>(null);
  const [esercizi, setEsercizi] = useState<Esercizio[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSessione();
  }, [sessioneId]);

  const loadSessione = async () => {
    try {
      setLoading(true);
      const sessioneData = await getSessione(sessioneId);

      if (!sessioneData) {
        Alert.alert('Errore', 'Sessione non trovata');
        onBack?.();
        return;
      }

      setSessione(sessioneData);

      // Carica dati utenti
      const [allievoData, collaboratoreData] = await Promise.all([
        getUser(sessioneData.allievoId),
        getUser(sessioneData.collaboratoreId),
      ]);

      setAllievo(allievoData);
      setCollaboratore(collaboratoreData);

      // Carica esercizi se presenti
      if (sessioneData.esercizi && sessioneData.esercizi.length > 0) {
        const eserciziData = await Promise.all(
          sessioneData.esercizi.map((e) => getEsercizio(e.esercizioId))
        );
        setEsercizi(eserciziData.filter((e): e is Esercizio => e !== null));
      }
    } catch (error) {
      console.error('Errore caricamento sessione:', error);
      Alert.alert('Errore', 'Impossibile caricare la sessione');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleta = async () => {
    Alert.alert(
      'Completa Sessione',
      'Vuoi segnare questa sessione come completata?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Completa',
          onPress: async () => {
            try {
              setActionLoading(true);
              await completaSessione(sessioneId);
              Alert.alert('Successo', 'Sessione completata!');
              onSessioneUpdated?.();
              loadSessione();
            } catch (error) {
              Alert.alert('Errore', 'Impossibile completare la sessione');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAnnulla = async () => {
    Alert.alert(
      'Annulla Sessione',
      'Sei sicuro di voler annullare questa sessione?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, annulla',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const result = await annullaSessione(sessioneId);

              if (result.success) {
                Alert.alert('Successo', result.message);
                onSessioneUpdated?.();
                loadSessione();
              } else {
                Alert.alert('Errore', result.message);
              }
            } catch (error) {
              Alert.alert('Errore', 'Impossibile annullare la sessione');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatoStyle = (stato: string) => {
    switch (stato) {
      case 'completata':
        return { backgroundColor: COLORS.success + '20', color: COLORS.success };
      case 'annullata':
        return { backgroundColor: COLORS.error + '20', color: COLORS.error };
      default:
        return { backgroundColor: COLORS.info + '20', color: COLORS.info };
    }
  };

  const formatTipoSessione = (tipo: string) => {
    switch (tipo) {
      case 'allenamento':
        return 'Allenamento';
      case 'consulenza_nutrizionale':
        return 'Consulenza Nutrizionale';
      case 'valutazione':
        return 'Valutazione';
      default:
        return tipo;
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento sessione..." />;
  }

  if (!sessione) {
    return null;
  }

  const statoStyle = getStatoStyle(sessione.stato);
  const dataSessione = new Date(sessione.data);
  const canModify = user?.ruolo !== 'allievo' || sessione.stato === 'programmata';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con stato */}
      <View style={styles.header}>
        <View style={[styles.statoBadge, { backgroundColor: statoStyle.backgroundColor }]}>
          <Text style={[styles.statoText, { color: statoStyle.color }]}>
            {sessione.stato.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.tipoSessione}>{formatTipoSessione(sessione.tipo)}</Text>
      </View>

      {/* Data e ora */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Data e Ora</Text>
        <Text style={styles.dateText}>
          {dataSessione.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.timeText}>
          {dataSessione.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' - '}
          {new Date(dataSessione.getTime() + sessione.durata * 60000).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.durataText}>{sessione.durata} minuti</Text>
      </Card>

      {/* Partecipanti */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Partecipanti</Text>

        {allievo && (
          <View style={styles.partecipante}>
            <View style={[styles.avatar, { backgroundColor: COLORS.allievo }]}>
              <Text style={styles.avatarText}>
                {allievo.nome[0]}{allievo.cognome[0]}
              </Text>
            </View>
            <View style={styles.partecipanteInfo}>
              <Text style={styles.partecipanteNome}>
                {allievo.nome} {allievo.cognome}
              </Text>
              <Text style={styles.partecipanteRuolo}>Allievo</Text>
            </View>
          </View>
        )}

        {collaboratore && (
          <View style={styles.partecipante}>
            <View style={[styles.avatar, { backgroundColor: COLORS.collaboratore }]}>
              <Text style={styles.avatarText}>
                {collaboratore.nome[0]}{collaboratore.cognome[0]}
              </Text>
            </View>
            <View style={styles.partecipanteInfo}>
              <Text style={styles.partecipanteNome}>
                {collaboratore.nome} {collaboratore.cognome}
              </Text>
              <Text style={styles.partecipanteRuolo}>Coach</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Esercizi (se presenti) */}
      {esercizi.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Esercizi</Text>
          {sessione.esercizi?.map((ex, index) => {
            const esercizio = esercizi.find((e) => e.id === ex.esercizioId);
            return (
              <View key={index} style={styles.esercizioItem}>
                <Text style={styles.esercizioNome}>
                  {esercizio?.nome || 'Esercizio'}
                </Text>
                <Text style={styles.esercizioDetails}>
                  {ex.serie} × {ex.ripetizioni} | Rec: {ex.recupero}s
                </Text>
                {ex.note && (
                  <Text style={styles.esercizioNote}>{ex.note}</Text>
                )}
              </View>
            );
          })}
        </Card>
      )}

      {/* Note */}
      {sessione.noteCollaboratore && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Note del Coach</Text>
          <Text style={styles.noteText}>{sessione.noteCollaboratore}</Text>
        </Card>
      )}

      {/* Azioni */}
      {sessione.stato === 'programmata' && canModify && (
        <View style={styles.actions}>
          {user?.ruolo !== 'allievo' && (
            <Button
              title="Completa Sessione"
              onPress={handleCompleta}
              loading={actionLoading}
              style={styles.actionButton}
            />
          )}
          <Button
            title="Annulla Sessione"
            onPress={handleAnnulla}
            variant="outline"
            loading={actionLoading}
            style={styles.actionButton}
          />
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statoBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.sm,
  },
  statoText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tipoSessione: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  durataText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  partecipante: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.md,
  },
  partecipanteInfo: {
    flex: 1,
  },
  partecipanteNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  partecipanteRuolo: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  esercizioItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  esercizioNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  esercizioDetails: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  esercizioNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noteText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    width: '100%',
  },
});

export default SessioneDetailScreen;
