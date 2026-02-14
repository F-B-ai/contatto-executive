// App ESSĒRE - Test Posturale Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Loading } from '../../components/common';
import {
  creaTestPosturale,
  aggiungiImmagineTest,
  completaTestPosturale,
} from '../../services/testPosturaleService';
import { TipoImmaginePosturale, ImmaginePosturale } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface TestPosturaleScreenProps {
  route: {
    params: {
      allievoId: string;
    };
  };
  navigation: any;
}

const POSIZIONI: { tipo: TipoImmaginePosturale; label: string; icon: string }[] = [
  { tipo: 'fronte', label: 'Frontale', icon: '🧍' },
  { tipo: 'retro', label: 'Posteriore', icon: '🧍‍♂️' },
  { tipo: 'lato_dx', label: 'Lato Destro', icon: '➡️' },
  { tipo: 'lato_sx', label: 'Lato Sinistro', icon: '⬅️' },
];

export const TestPosturaleScreen: React.FC<TestPosturaleScreenProps> = ({
  route,
  navigation,
}) => {
  const { allievoId } = route.params;
  const { user } = useAuth();

  const [testId, setTestId] = useState<string | null>(null);
  const [immagini, setImmagini] = useState<Record<TipoImmaginePosturale, string | null>>({
    fronte: null,
    retro: null,
    lato_dx: null,
    lato_sx: null,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  const initTest = async () => {
    if (!user) return;

    try {
      const test = await creaTestPosturale(allievoId, user.id);
      setTestId(test.id);
    } catch (error) {
      console.error('Errore creazione test:', error);
      Alert.alert('Errore', 'Impossibile creare il test');
    }
  };

  const takePhoto = async (tipo: TipoImmaginePosturale) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per usare la fotocamera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (!testId) {
        await initTest();
      }

      setImmagini({ ...immagini, [tipo]: result.assets[0].uri });

      if (testId) {
        try {
          await aggiungiImmagineTest(testId, result.assets[0].uri, tipo);
        } catch (error) {
          console.error('Errore upload immagine:', error);
        }
      }
    }
  };

  const pickImage = async (tipo: TipoImmaginePosturale) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (!testId) {
        await initTest();
      }

      setImmagini({ ...immagini, [tipo]: result.assets[0].uri });

      if (testId) {
        try {
          await aggiungiImmagineTest(testId, result.assets[0].uri, tipo);
        } catch (error) {
          console.error('Errore upload immagine:', error);
        }
      }
    }
  };

  const canAnalyze = () => {
    const immaginiCaricate = Object.values(immagini).filter(Boolean).length;
    return immaginiCaricate >= 2; // Minimo 2 foto per analisi
  };

  const handleAnalyze = async () => {
    if (!testId) {
      Alert.alert('Errore', 'Test non inizializzato');
      return;
    }

    setAnalyzing(true);
    try {
      const risultato = await completaTestPosturale(testId, note);

      Alert.alert(
        'Analisi completata!',
        'Il report è stato generato con successo.',
        [
          {
            text: 'Visualizza',
            onPress: () =>
              navigation.replace('TestPosturaleDetail', { testId: risultato.id }),
          },
        ]
      );
    } catch (error) {
      console.error('Errore analisi:', error);
      Alert.alert('Errore', 'Impossibile completare lanalisi');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>📸</Text>
        <Text style={styles.infoTitle}>Come scattare le foto</Text>
        <Text style={styles.infoText}>
          1. Posiziona l'allievo su uno sfondo neutro{'\n'}
          2. Assicurati che sia ben illuminato{'\n'}
          3. Scatta foto da tutte e 4 le posizioni{'\n'}
          4. L'allievo deve essere in posizione naturale
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Foto posturali</Text>

      <View style={styles.gridContainer}>
        {POSIZIONI.map((pos) => (
          <View key={pos.tipo} style={styles.photoCard}>
            <Text style={styles.photoLabel}>
              {pos.icon} {pos.label}
            </Text>

            {immagini[pos.tipo] ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: immagini[pos.tipo]! }}
                  style={styles.photo}
                />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => takePhoto(pos.tipo)}
                >
                  <Text style={styles.retakeText}>Rifai</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => takePhoto(pos.tipo)}
                >
                  <Text style={styles.photoButtonIcon}>📷</Text>
                  <Text style={styles.photoButtonText}>Scatta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => pickImage(pos.tipo)}
                >
                  <Text style={styles.photoButtonIcon}>🖼️</Text>
                  <Text style={styles.photoButtonText}>Galleria</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>
          Foto caricate: {Object.values(immagini).filter(Boolean).length}/4
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(Object.values(immagini).filter(Boolean).length / 4) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {canAnalyze()
            ? '✅ Puoi procedere con l'analisi'
            : '⚠️ Carica almeno 2 foto per l'analisi'}
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title={analyzing ? 'Analisi in corso...' : 'Analizza postura'}
          onPress={handleAnalyze}
          loading={analyzing}
          disabled={!canAnalyze() || analyzing}
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
  infoCard: {
    margin: SPACING.md,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  photoCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  photoLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  photoContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  retakeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  photoPlaceholder: {
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  photoButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  photoButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  progressCard: {
    margin: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});

export default TestPosturaleScreen;
