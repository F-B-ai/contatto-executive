import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

type TipoContenuto = 'tutti' | 'video' | 'podcast' | 'documenti';

export const ContenutiScreen: React.FC = () => {
  const [filtro, setFiltro] = useState<TipoContenuto>('tutti');

  // Mock data
  const contenuti = [
    {
      id: '1',
      tipo: 'video',
      titolo: 'Tecnica Squat Perfetta',
      descrizione: 'Impara la tecnica corretta per uno squat sicuro ed efficace',
      durata: '8:30',
      nuovo: true,
    },
    {
      id: '2',
      tipo: 'podcast',
      titolo: 'Mindset e Allenamento',
      descrizione: 'Come mantenere la motivazione alta durante il percorso',
      durata: '25:00',
      nuovo: true,
    },
    {
      id: '3',
      tipo: 'video',
      titolo: 'Stretching Post Workout',
      descrizione: 'Routine completa di stretching per il recupero',
      durata: '12:00',
      nuovo: false,
    },
    {
      id: '4',
      tipo: 'documenti',
      titolo: 'Guida Alimentazione Base',
      descrizione: 'Principi fondamentali per una corretta alimentazione',
      durata: 'PDF',
      nuovo: false,
    },
    {
      id: '5',
      tipo: 'video',
      titolo: 'Mobilità Spalle',
      descrizione: 'Esercizi per migliorare la mobilità delle spalle',
      durata: '6:45',
      nuovo: false,
    },
  ];

  const filteredContenuti = filtro === 'tutti'
    ? contenuti
    : contenuti.filter(c => c.tipo === filtro);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return '🎬';
      case 'podcast': return '🎧';
      case 'documenti': return '📄';
      default: return '📁';
    }
  };

  return (
    <View style={styles.container}>
      {/* Filtri */}
      <ScrollView horizontal style={styles.filtriContainer} showsHorizontalScrollIndicator={false}>
        {(['tutti', 'video', 'podcast', 'documenti'] as TipoContenuto[]).map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.filtroChip, filtro === tipo && styles.filtroChipActive]}
            onPress={() => setFiltro(tipo)}
          >
            <Text style={[styles.filtroText, filtro === tipo && styles.filtroTextActive]}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista Contenuti */}
      <ScrollView style={styles.listaContainer}>
        {filteredContenuti.map((contenuto) => (
          <Card key={contenuto.id} style={styles.contenutoCard} onPress={() => {}}>
            <View style={styles.contenutoRow}>
              <View style={styles.contenutoIcon}>
                <Text style={styles.contenutoIconText}>{getIcon(contenuto.tipo)}</Text>
              </View>
              <View style={styles.contenutoInfo}>
                <View style={styles.contenutoHeader}>
                  <Text style={styles.contenutoTitolo}>{contenuto.titolo}</Text>
                  {contenuto.nuovo && (
                    <View style={styles.nuovoBadge}>
                      <Text style={styles.nuovoText}>NUOVO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.contenutoDescrizione} numberOfLines={2}>
                  {contenuto.descrizione}
                </Text>
                <View style={styles.contenutoMeta}>
                  <Text style={styles.contenutoDurata}>{contenuto.durata}</Text>
                  <Text style={styles.contenutoTipo}>{contenuto.tipo}</Text>
                </View>
              </View>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </Card>
        ))}

        {filteredContenuti.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nessun contenuto disponibile</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtriContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filtroChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radiusFull,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  filtroChipActive: {
    backgroundColor: COLORS.allievo,
  },
  filtroText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  filtroTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listaContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  contenutoCard: {
    marginBottom: SPACING.md,
  },
  contenutoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contenutoIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDERS.radiusMedium,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contenutoIconText: {
    fontSize: 24,
  },
  contenutoInfo: {
    flex: 1,
  },
  contenutoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contenutoTitolo: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    flex: 1,
  },
  nuovoBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nuovoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  contenutoDescrizione: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  contenutoMeta: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  contenutoDurata: {
    ...TYPOGRAPHY.caption,
    color: COLORS.allievo,
    fontWeight: '600',
  },
  contenutoTipo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  playIcon: {
    fontSize: 24,
    color: COLORS.allievo,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
