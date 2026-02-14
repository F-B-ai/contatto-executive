// App ESSĒRE - Programma Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Loading, Card, Button } from '../../components/common';
import { getProgrammaById } from '../../services/programService';
import { Programma, SessioneProgramma } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ProgrammaDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

const GIORNI = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export const ProgrammaDetailScreen: React.FC<ProgrammaDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [programma, setProgramma] = useState<Programma | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    loadProgramma();
  }, [id]);

  const loadProgramma = async () => {
    try {
      const data = await getProgrammaById(id);
      setProgramma(data);
    } catch (error) {
      console.error('Errore caricamento programma:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessioniSettimana = (settimana: number): SessioneProgramma[] => {
    if (!programma?.sessioni) return [];
    return programma.sessioni.filter((s) => s.settimana === settimana);
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento programma..." />;
  }

  if (!programma) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Programma non trovato</Text>
      </View>
    );
  }

  const sessioniSettimana = getSessioniSettimana(selectedWeek);
  const settimane = Array.from({ length: programma.durataSettimane }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{programma.nome}</Text>
        <Text style={styles.durata}>
          {programma.durataSettimane} settimane • {programma.sessioni?.length || 0} sessioni
        </Text>
        {programma.descrizione && (
          <Text style={styles.descrizione}>{programma.descrizione}</Text>
        )}
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
                Sett. {week}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sessioni della settimana */}
      <View style={styles.sessioniContainer}>
        {sessioniSettimana.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nessuna sessione per questa settimana
            </Text>
          </Card>
        ) : (
          sessioniSettimana.map((sessione, index) => (
            <Card key={index} style={styles.sessioneCard}>
              <View style={styles.sessioneHeader}>
                <View style={styles.giornoContainer}>
                  <Text style={styles.giornoIcon}>📅</Text>
                  <Text style={styles.giornoText}>
                    {GIORNI[sessione.giorno] || `Giorno ${sessione.giorno}`}
                  </Text>
                </View>
                <Text style={styles.esercizioCount}>
                  {sessione.esercizi?.length || 0} esercizi
                </Text>
              </View>

              {sessione.esercizi && sessione.esercizi.length > 0 && (
                <View style={styles.eserciziList}>
                  {sessione.esercizi.map((es, esIndex) => (
                    <View key={esIndex} style={styles.esercizioItem}>
                      <View style={styles.esercizioNumber}>
                        <Text style={styles.esercizioNumberText}>
                          {esIndex + 1}
                        </Text>
                      </View>
                      <View style={styles.esercizioInfo}>
                        <Text style={styles.esercizioNome}>
                          Esercizio {es.esercizioId.substring(0, 8)}
                        </Text>
                        <Text style={styles.esercizioDetails}>
                          {es.serie}×{es.ripetizioni} • {es.recupero}s recupero
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))
        )}
      </View>

      {/* Allievi assegnati */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          Allievi assegnati ({programma.assegnatoA?.length || 0})
        </Text>
        {(!programma.assegnatoA || programma.assegnatoA.length === 0) ? (
          <Text style={styles.noAllievi}>
            Nessun allievo assegnato a questo programma
          </Text>
        ) : (
          <Text style={styles.allieviList}>
            {programma.assegnatoA.join(', ')}
          </Text>
        )}
      </Card>

      {/* Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creato il</Text>
          <Text style={styles.infoValue}>
            {programma.createdAt?.toLocaleDateString('it-IT') || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ultimo aggiornamento</Text>
          <Text style={styles.infoValue}>
            {programma.updatedAt?.toLocaleDateString('it-IT') || 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <Button
          title="Modifica programma"
          onPress={() => {}}
          variant="outline"
        />
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
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  durata: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  descrizione: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  weekSelector: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  weekTabActive: {
    backgroundColor: COLORS.primary,
  },
  weekTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  weekTabTextActive: {
    color: COLORS.white,
  },
  sessioniContainer: {
    padding: SPACING.md,
  },
  sessioneCard: {
    marginBottom: SPACING.sm,
  },
  sessioneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  giornoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giornoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  giornoText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  esercizioCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  eserciziList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  esercizioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  esercizioNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  esercizioNumberText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  esercizioInfo: {
    flex: 1,
  },
  esercizioNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  esercizioDetails: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  noAllievi: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  allieviList: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
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
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
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

export default ProgrammaDetailScreen;
