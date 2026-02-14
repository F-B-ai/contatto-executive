// App ESSĒRE - Programma Allievo Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card } from '../../components/common';
import { getProgrammiByAllievo } from '../../services/programService';
import { Programma, SessioneProgramma } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ProgrammaAllievoScreenProps {
  navigation: any;
}

const GIORNI = ['', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const ProgrammaAllievoScreen: React.FC<ProgrammaAllievoScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [programma, setProgramma] = useState<Programma | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7);

  useEffect(() => {
    loadProgramma();
  }, [user]);

  const loadProgramma = async () => {
    if (!user) return;

    try {
      const programmi = await getProgrammiByAllievo(user.id);
      if (programmi.length > 0) {
        setProgramma(programmi[0]); // Prendi il programma attivo
      }
    } catch (error) {
      console.error('Errore caricamento programma:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessioneGiorno = (): SessioneProgramma | undefined => {
    if (!programma?.sessioni) return undefined;
    return programma.sessioni.find(
      (s) => s.settimana === selectedWeek && s.giorno === selectedDay
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento programma..." />;
  }

  if (!programma) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Nessun programma assegnato</Text>
        <Text style={styles.emptyText}>
          Il tuo trainer ti assegnerà presto un programma personalizzato
        </Text>
      </View>
    );
  }

  const sessioneGiorno = getSessioneGiorno();
  const settimane = Array.from({ length: programma.durataSettimane }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{programma.nome}</Text>
        <Text style={styles.subtitle}>
          Settimana {selectedWeek} di {programma.durataSettimane}
        </Text>
      </View>

      {/* Selettore settimana */}
      <View style={styles.weekSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {settimane.map((week) => (
            <TouchableOpacity
              key={week}
              style={[
                styles.weekTab,
                selectedWeek === week && styles.weekTabActive,
              ]}
              onPress={() => setSelectedWeek(week)}
            >
              <Text
                style={[
                  styles.weekTabText,
                  selectedWeek === week && styles.weekTabTextActive,
                ]}
              >
                {week}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selettore giorno */}
      <View style={styles.daySelector}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const hasSession = programma.sessioni?.some(
            (s) => s.settimana === selectedWeek && s.giorno === day
          );

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayTab,
                selectedDay === day && styles.dayTabActive,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayTabText,
                  selectedDay === day && styles.dayTabTextActive,
                ]}
              >
                {GIORNI[day]}
              </Text>
              {hasSession && (
                <View
                  style={[
                    styles.dayDot,
                    selectedDay === day && styles.dayDotActive,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sessione del giorno */}
      <View style={styles.sessionContainer}>
        {!sessioneGiorno ? (
          <Card style={styles.restCard}>
            <Text style={styles.restIcon}>😴</Text>
            <Text style={styles.restTitle}>Giorno di riposo</Text>
            <Text style={styles.restText}>
              Nessun allenamento previsto per oggi. Riposati e recupera!
            </Text>
          </Card>
        ) : (
          <Card style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>Allenamento</Text>
              <Text style={styles.workoutCount}>
                {sessioneGiorno.esercizi?.length || 0} esercizi
              </Text>
            </View>

            {sessioneGiorno.esercizi?.map((esercizio, index) => (
              <TouchableOpacity
                key={index}
                style={styles.esercizioCard}
                onPress={() =>
                  navigation.navigate('EsercizioDetail', {
                    id: esercizio.esercizioId,
                  })
                }
              >
                <View style={styles.esercizioNumber}>
                  <Text style={styles.esercizioNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.esercizioInfo}>
                  <Text style={styles.esercizioNome}>
                    Esercizio {esercizio.esercizioId.substring(0, 8)}
                  </Text>
                  <View style={styles.esercizioStats}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>
                        {esercizio.serie} serie
                      </Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>
                        {esercizio.ripetizioni} reps
                      </Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>
                        {esercizio.recupero}s rec
                      </Text>
                    </View>
                  </View>
                  {esercizio.note && (
                    <Text style={styles.esercizioNote}>{esercizio.note}</Text>
                  )}
                </View>
                <Text style={styles.esercizioArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </View>
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
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
  },
  weekSelector: {
    backgroundColor: COLORS.allievo,
    paddingBottom: SPACING.md,
  },
  weekTab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  weekTabActive: {
    backgroundColor: COLORS.white,
  },
  weekTabText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  weekTabTextActive: {
    color: COLORS.allievo,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  dayTab: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  dayTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.allievo,
  },
  dayTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dayTabTextActive: {
    color: COLORS.allievo,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginTop: 4,
  },
  dayDotActive: {
    backgroundColor: COLORS.allievo,
  },
  sessionContainer: {
    padding: SPACING.md,
  },
  restCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  restIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  restTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  restText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  workoutCard: {},
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  workoutTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workoutCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  esercizioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  esercizioNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  esercizioNumberText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  esercizioInfo: {
    flex: 1,
  },
  esercizioNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  esercizioStats: {
    flexDirection: 'row',
  },
  statBadge: {
    backgroundColor: `${COLORS.allievo}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.allievo,
    fontWeight: '500',
  },
  esercizioNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  esercizioArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProgrammaAllievoScreen;
