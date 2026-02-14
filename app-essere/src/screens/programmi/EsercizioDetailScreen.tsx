// App ESSĒRE - Esercizio Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Loading, Card } from '../../components/common';
import { getEsercizioById } from '../../services/programService';
import { Esercizio } from '../../types';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface EsercizioDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

const { width } = Dimensions.get('window');

export const EsercizioDetailScreen: React.FC<EsercizioDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [esercizio, setEsercizio] = useState<Esercizio | null>(null);

  useEffect(() => {
    loadEsercizio();
  }, [id]);

  const loadEsercizio = async () => {
    try {
      const data = await getEsercizioById(id);
      setEsercizio(data);
    } catch (error) {
      console.error('Errore caricamento esercizio:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      forza: '💪',
      mobilita: '🤸',
      cardio: '❤️',
      core: '🎯',
      stretching: '🧘',
      funzionale: '⚡',
      posturale: '🧍',
    };
    return icons[categoria] || '🏋️';
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  if (!esercizio) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Esercizio non trovato</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Video o Immagine */}
      {esercizio.videoUrl ? (
        <Video
          source={{ uri: esercizio.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      ) : esercizio.immagineUrl ? (
        <Image
          source={{ uri: esercizio.immagineUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderMedia}>
          <Text style={styles.placeholderIcon}>🏋️</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaIcon}>
              {getCategoriaIcon(esercizio.categoria)}
            </Text>
            <Text style={styles.categoriaText}>{esercizio.categoria}</Text>
          </View>
          <Text style={styles.nome}>{esercizio.nome}</Text>
        </View>

        {/* Descrizione */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Descrizione</Text>
          <Text style={styles.descrizione}>{esercizio.descrizione}</Text>
        </Card>

        {/* Istruzioni */}
        {esercizio.istruzioni && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Come eseguire</Text>
            <Text style={styles.istruzioni}>{esercizio.istruzioni}</Text>
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Suggerimenti</Text>
            <Text style={styles.tipsText}>
              • Mantieni sempre il controllo del movimento{'\n'}
              • Respira in modo coordinato{'\n'}
              • Se senti dolore, fermati e consulta il trainer
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  video: {
    width: width,
    height: width * 0.75,
    backgroundColor: COLORS.black,
  },
  image: {
    width: width,
    height: width * 0.75,
  },
  placeholderMedia: {
    width: width,
    height: width * 0.5,
    backgroundColor: `${COLORS.allievo}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  categoriaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.allievo}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  categoriaIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoriaText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.allievo,
    textTransform: 'capitalize',
  },
  nome: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  descrizione: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  istruzioni: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}10`,
    marginBottom: SPACING.xxl,
  },
  tipsIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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

export default EsercizioDetailScreen;
