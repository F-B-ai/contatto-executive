import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const ProgrammaScreen: React.FC = () => {
  const [giornoSelezionato, setGiornoSelezionato] = useState(1);

  // Mock data
  const programma = {
    nome: 'Forza Base',
    settimana: 3,
    totaleSettimane: 8,
    giorni: [
      {
        giorno: 1,
        nome: 'Lunedì - Upper Body',
        esercizi: [
          { id: '1', nome: 'Panca Piana', serie: 4, reps: '8-10', recupero: 90, videoUrl: true },
          { id: '2', nome: 'Rematore', serie: 4, reps: '10-12', recupero: 60, videoUrl: true },
          { id: '3', nome: 'Military Press', serie: 3, reps: '10', recupero: 60, videoUrl: true },
          { id: '4', nome: 'Curl Bicipiti', serie: 3, reps: '12', recupero: 45, videoUrl: false },
        ],
      },
      {
        giorno: 2,
        nome: 'Mercoledì - Lower Body',
        esercizi: [
          { id: '5', nome: 'Squat', serie: 4, reps: '8-10', recupero: 120, videoUrl: true },
          { id: '6', nome: 'Leg Press', serie: 4, reps: '12', recupero: 90, videoUrl: true },
          { id: '7', nome: 'Affondi', serie: 3, reps: '10/gamba', recupero: 60, videoUrl: true },
        ],
      },
      {
        giorno: 3,
        nome: 'Venerdì - Full Body',
        esercizi: [
          { id: '8', nome: 'Stacchi', serie: 4, reps: '6-8', recupero: 120, videoUrl: true },
          { id: '9', nome: 'Pull Up', serie: 3, reps: 'Max', recupero: 90, videoUrl: true },
          { id: '10', nome: 'Dips', serie: 3, reps: 'Max', recupero: 60, videoUrl: false },
        ],
      },
    ],
  };

  const giornoAttuale = programma.giorni.find(g => g.giorno === giornoSelezionato);

  return (
    <ScrollView style={styles.container}>
      {/* Header Programma */}
      <View style={styles.header}>
        <Text style={styles.programmaNome}>{programma.nome}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Settimana {programma.settimana} di {programma.totaleSettimane}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(programma.settimana / programma.totaleSettimane) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Giorni Selector */}
      <View style={styles.giorniContainer}>
        {programma.giorni.map((giorno) => (
          <TouchableOpacity
            key={giorno.giorno}
            style={[
              styles.giornoButton,
              giornoSelezionato === giorno.giorno && styles.giornoButtonActive,
            ]}
            onPress={() => setGiornoSelezionato(giorno.giorno)}
          >
            <Text
              style={[
                styles.giornoText,
                giornoSelezionato === giorno.giorno && styles.giornoTextActive,
              ]}
            >
              Giorno {giorno.giorno}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Titolo Giorno */}
      {giornoAttuale && (
        <>
          <Text style={styles.giornoTitolo}>{giornoAttuale.nome}</Text>

          {/* Lista Esercizi */}
          {giornoAttuale.esercizi.map((esercizio, index) => (
            <Card key={esercizio.id} style={styles.esercizioCard}>
              <View style={styles.esercizioHeader}>
                <View style={styles.esercizioNumero}>
                  <Text style={styles.esercizioNumeroText}>{index + 1}</Text>
                </View>
                <View style={styles.esercizioInfo}>
                  <Text style={styles.esercizioNome}>{esercizio.nome}</Text>
                  {esercizio.videoUrl && (
                    <TouchableOpacity style={styles.videoButton}>
                      <Text style={styles.videoButtonText}>▶ Video</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.esercizioDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{esercizio.serie}</Text>
                  <Text style={styles.detailLabel}>Serie</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{esercizio.reps}</Text>
                  <Text style={styles.detailLabel}>Reps</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{esercizio.recupero}s</Text>
                  <Text style={styles.detailLabel}>Recupero</Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

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
    padding: SPACING.lg,
    backgroundColor: COLORS.allievo,
  },
  programmaNome: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  progressContainer: {},
  progressText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  giorniContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  giornoButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusMedium,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
  },
  giornoButtonActive: {
    backgroundColor: COLORS.allievo,
  },
  giornoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  giornoTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  giornoTitolo: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  esercizioCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  esercizioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  esercizioNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  esercizioNumeroText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  esercizioInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  esercizioNome: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  videoButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  videoButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  esercizioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
