// App ESSĒRE - Test Posturale Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Loading, Card } from '../../components/common';
import { getTestPosturale } from '../../services/testPosturaleService';
import { getUserById } from '../../services/userService';
import { TestPosturale, User, TipoImmaginePosturale } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface TestPosturaleDetailScreenProps {
  route: {
    params: {
      testId: string;
    };
  };
  navigation: any;
}

const POSIZIONI_LABELS: Record<TipoImmaginePosturale, string> = {
  fronte: 'Frontale',
  retro: 'Posteriore',
  lato_dx: 'Lato Destro',
  lato_sx: 'Lato Sinistro',
};

export const TestPosturaleDetailScreen: React.FC<TestPosturaleDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { testId } = route.params;
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<TestPosturale | null>(null);
  const [allievo, setAllievo] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      const testData = await getTestPosturale(testId);
      setTest(testData);

      if (testData) {
        const allievoData = await getUserById(testData.allievoId);
        setAllievo(allievoData);
      }
    } catch (error) {
      console.error('Errore caricamento test:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento test..." />;
  }

  if (!test) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Test non trovato</Text>
      </View>
    );
  }

  const nomeAllievo = allievo ? `${allievo.nome} ${allievo.cognome}` : 'Allievo';

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.allievoName}>{nomeAllievo}</Text>
        <Text style={styles.date}>
          {test.data.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </Card>

      {test.immagini && test.immagini.length > 0 && (
        <Card style={styles.imagesCard}>
          <Text style={styles.sectionTitle}>Foto analizzate</Text>

          {/* Immagine principale */}
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: test.immagini[selectedImage]?.url }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            <Text style={styles.imageLabel}>
              {POSIZIONI_LABELS[test.immagini[selectedImage]?.tipo]}
            </Text>
          </View>

          {/* Thumbnails */}
          <View style={styles.thumbnailsContainer}>
            {test.immagini.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailSelected,
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image source={{ uri: img.url }} style={styles.thumbnailImage} />
                <Text style={styles.thumbnailLabel}>
                  {POSIZIONI_LABELS[img.tipo]?.substring(0, 4)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {test.report && (
        <Card style={styles.reportCard}>
          <Text style={styles.sectionTitle}>Report analisi</Text>
          <Text style={styles.reportText}>{test.report}</Text>
        </Card>
      )}

      {test.immagini[selectedImage]?.analisiAI && (
        <Card style={styles.analysisCard}>
          <Text style={styles.sectionTitle}>Dettagli analisi AI</Text>

          <View style={styles.analysisSection}>
            <Text style={styles.analysisSubtitle}>Problemi rilevati</Text>
            {test.immagini[selectedImage].analisiAI?.problemiRilevati.map(
              (problema, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{problema}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.analysisSubtitle}>Suggerimenti</Text>
            {test.immagini[selectedImage].analisiAI?.suggerimenti.map(
              (suggerimento, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>✓</Text>
                  <Text style={styles.bulletText}>{suggerimento}</Text>
                </View>
              )
            )}
          </View>
        </Card>
      )}

      {test.noteManuali && (
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Note del trainer</Text>
          <Text style={styles.notesText}>{test.noteManuali}</Text>
        </Card>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Test eseguito il {test.data.toLocaleDateString('it-IT')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    margin: SPACING.md,
    alignItems: 'center',
  },
  allievoName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  imagesCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  mainImageContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    fontSize: FONT_SIZE.sm,
    overflow: 'hidden',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: '23%',
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reportCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  reportText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  analysisCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  analysisSection: {
    marginBottom: SPACING.md,
  },
  analysisSubtitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    width: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  notesCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  notesText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
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

export default TestPosturaleDetailScreen;
