// App ESSĒRE - Nuovo Contenuto Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components/common';
import { creaContenuto, uploadContenutoFile, CATEGORIE_CONTENUTI } from '../../services/contenutoService';
import { TipoContenuto } from '../../types';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface NuovoContenutoScreenProps {
  navigation: any;
}

const TIPI_CONTENUTO: { tipo: TipoContenuto; label: string; icon: string }[] = [
  { tipo: 'video', label: 'Video', icon: '🎬' },
  { tipo: 'podcast', label: 'Podcast', icon: '🎙️' },
  { tipo: 'documento', label: 'Documento', icon: '📄' },
  { tipo: 'link', label: 'Link', icon: '🔗' },
];

export const NuovoContenutoScreen: React.FC<NuovoContenutoScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [tipo, setTipo] = useState<TipoContenuto>('video');
  const [categoria, setCategoria] = useState('');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: tipo === 'video' ? 'video/*' : tipo === 'podcast' ? 'audio/*' : '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUrl(result.assets[0].uri);
        setFileName(result.assets[0].name);
      }
    } catch (error) {
      console.error('Errore selezione file:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!titolo.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo');
      return;
    }

    if (!descrizione.trim()) {
      Alert.alert('Errore', 'Inserisci una descrizione');
      return;
    }

    if (!categoria) {
      Alert.alert('Errore', 'Seleziona una categoria');
      return;
    }

    if (!url.trim()) {
      Alert.alert('Errore', tipo === 'link' ? 'Inserisci un URL' : 'Seleziona un file');
      return;
    }

    setLoading(true);
    try {
      let finalUrl = url;

      // Upload file se non è un link
      if (tipo !== 'link' && !url.startsWith('http')) {
        finalUrl = await uploadContenutoFile(url, tipo, fileName);
      }

      await creaContenuto({
        titolo: titolo.trim(),
        descrizione: descrizione.trim(),
        tipo,
        url: finalUrl,
        categoria,
        creatoDa: user.id,
        visibileA: 'tutti',
      });

      Alert.alert('Successo', 'Contenuto creato con successo', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Errore creazione contenuto:', error);
      Alert.alert('Errore', 'Impossibile creare il contenuto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tipo contenuto */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo di contenuto</Text>
        <View style={styles.tipoGrid}>
          {TIPI_CONTENUTO.map((t) => (
            <TouchableOpacity
              key={t.tipo}
              style={[
                styles.tipoOption,
                tipo === t.tipo && styles.tipoOptionSelected,
              ]}
              onPress={() => {
                setTipo(t.tipo);
                setUrl('');
                setFileName('');
              }}
            >
              <Text style={styles.tipoIcon}>{t.icon}</Text>
              <Text
                style={[
                  styles.tipoLabel,
                  tipo === t.tipo && styles.tipoLabelSelected,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Info base */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni</Text>
        <Input
          label="Titolo"
          value={titolo}
          onChangeText={setTitolo}
          placeholder="Es: Introduzione al fitness"
        />
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descrizione</Text>
          <TextInput
            style={styles.textArea}
            value={descrizione}
            onChangeText={setDescrizione}
            placeholder="Descrivi il contenuto..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* Categoria */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Categoria</Text>
        <View style={styles.categorieGrid}>
          {CATEGORIE_CONTENUTI.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoriaChip,
                categoria === cat && styles.categoriaChipSelected,
              ]}
              onPress={() => setCategoria(cat)}
            >
              <Text
                style={[
                  styles.categoriaText,
                  categoria === cat && styles.categoriaTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* URL o File */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          {tipo === 'link' ? 'URL' : 'File'}
        </Text>

        {tipo === 'link' ? (
          <Input
            label="URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />
        ) : (
          <View>
            <TouchableOpacity style={styles.filePickerBtn} onPress={pickFile}>
              <Text style={styles.filePickerIcon}>📁</Text>
              <Text style={styles.filePickerText}>
                {fileName || 'Seleziona file'}
              </Text>
            </TouchableOpacity>
            {fileName && (
              <Text style={styles.fileSelected}>File selezionato: {fileName}</Text>
            )}
          </View>
        )}
      </Card>

      {/* Save button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Pubblica contenuto"
          onPress={handleSave}
          loading={loading}
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
  tipoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipoOption: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tipoOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  tipoIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  tipoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tipoLabelSelected: {
    color: COLORS.primary,
  },
  inputGroup: {
    marginTop: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categorieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoriaChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriaChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoriaText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  categoriaTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  filePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  filePickerIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  filePickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  fileSelected: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});

export default NuovoContenutoScreen;
