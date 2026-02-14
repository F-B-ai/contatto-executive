// App ESSĒRE - Nuova Diario Entry Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { Button, Card } from '../../components/common';
import { creaDiarioEntry, uploadDiarioImmagine } from '../../services/diarioService';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface NuovaDiarioEntryScreenProps {
  navigation: any;
}

export const NuovaDiarioEntryScreen: React.FC<NuovaDiarioEntryScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [umore, setUmore] = useState(7);
  const [note, setNote] = useState('');
  const [immagini, setImmagini] = useState<string[]>([]);
  const [condiviso, setCondiviso] = useState(true);
  const [loading, setLoading] = useState(false);

  const umoreOptions = [
    { value: 1, emoji: '😢', label: 'Molto male' },
    { value: 3, emoji: '😕', label: 'Male' },
    { value: 5, emoji: '😐', label: 'Così così' },
    { value: 7, emoji: '🙂', label: 'Bene' },
    { value: 9, emoji: '😄', label: 'Ottimo' },
    { value: 10, emoji: '🤩', label: 'Fantastico' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImmagini([...immagini, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per usare la fotocamera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImmagini([...immagini, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImmagini(immagini.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Upload immagini
      const uploadedUrls: string[] = [];
      for (const img of immagini) {
        const url = await uploadDiarioImmagine(user.id, img, `diary_${Date.now()}.jpg`);
        uploadedUrls.push(url);
      }

      // Crea entry
      await creaDiarioEntry(user.id, {
        umore,
        note: note.trim() || undefined,
        immagini: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        condiviso,
      });

      Alert.alert('Salvato!', 'La voce del diario è stata salvata.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      Alert.alert('Errore', 'Impossibile salvare la voce del diario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Come ti senti oggi?</Text>
        <View style={styles.umoreGrid}>
          {umoreOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.umoreOption,
                umore === option.value && styles.umoreOptionSelected,
              ]}
              onPress={() => setUmore(option.value)}
            >
              <Text style={styles.umoreEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.umoreLabel,
                  umore === option.value && styles.umoreLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.umoreSlider}>
          <Text style={styles.umoreValue}>{umore}/10</Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Note</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Come è andata la giornata? Come ti sei allenato?"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Foto</Text>
        <View style={styles.immaginiContainer}>
          {immagini.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {immagini.length < 3 && (
            <View style={styles.addImageButtons}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Text style={styles.addImageIcon}>🖼️</Text>
                <Text style={styles.addImageText}>Galleria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto}>
                <Text style={styles.addImageIcon}>📷</Text>
                <Text style={styles.addImageText}>Fotocamera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.condivisoRow}>
          <View>
            <Text style={styles.sectionTitle}>Condividi con il trainer</Text>
            <Text style={styles.condivisoSubtitle}>
              Il tuo trainer potrà vedere questa voce
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, condiviso && styles.toggleActive]}
            onPress={() => setCondiviso(!condiviso)}
          >
            <View
              style={[styles.toggleDot, condiviso && styles.toggleDotActive]}
            />
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Salva"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
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
  section: {
    margin: SPACING.md,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  umoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  umoreOption: {
    width: '30%',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: SPACING.sm,
  },
  umoreOptionSelected: {
    borderColor: COLORS.allievo,
    backgroundColor: `${COLORS.allievo}10`,
  },
  umoreEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  umoreLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  umoreLabelSelected: {
    color: COLORS.allievo,
    fontWeight: '600',
  },
  umoreSlider: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  umoreValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.allievo,
  },
  noteInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    minHeight: 120,
  },
  immaginiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  addImageButtons: {
    flexDirection: 'row',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  addImageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  condivisoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  condivisoSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    padding: 3,
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  saveButton: {
    backgroundColor: COLORS.allievo,
  },
});

export default NuovaDiarioEntryScreen;
