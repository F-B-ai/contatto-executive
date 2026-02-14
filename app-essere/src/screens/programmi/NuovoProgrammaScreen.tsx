// App ESSĒRE - Nuovo Programma Screen
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
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components/common';
import { creaProgramma } from '../../services/programService';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface NuovoProgrammaScreenProps {
  navigation: any;
}

export const NuovoProgrammaScreen: React.FC<NuovoProgrammaScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [durataSettimane, setDurataSettimane] = useState('4');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!nome.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il programma');
      return;
    }

    const durata = parseInt(durataSettimane);
    if (isNaN(durata) || durata < 1 || durata > 52) {
      Alert.alert('Errore', 'La durata deve essere tra 1 e 52 settimane');
      return;
    }

    setLoading(true);
    try {
      const programma = await creaProgramma({
        nome: nome.trim(),
        descrizione: descrizione.trim(),
        durataSettimane: durata,
        creatoDa: user.id,
        sessioni: [],
        assegnatoA: [],
      });

      Alert.alert('Successo', 'Programma creato con successo', [
        {
          text: 'Aggiungi sessioni',
          onPress: () => navigation.replace('ProgrammaDetail', { id: programma.id }),
        },
        {
          text: 'Chiudi',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Errore creazione programma:', error);
      Alert.alert('Errore', 'Impossibile creare il programma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni base</Text>

        <Input
          label="Nome del programma *"
          value={nome}
          onChangeText={setNome}
          placeholder="Es: Programma Principianti"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descrizione</Text>
          <TextInput
            style={styles.textArea}
            value={descrizione}
            onChangeText={setDescrizione}
            placeholder="Descrivi il programma, obiettivi, target..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Durata</Text>

        <View style={styles.durataContainer}>
          <TouchableOpacity
            style={styles.durataBtn}
            onPress={() => {
              const current = parseInt(durataSettimane) || 0;
              if (current > 1) setDurataSettimane((current - 1).toString());
            }}
          >
            <Text style={styles.durataBtnText}>-</Text>
          </TouchableOpacity>

          <View style={styles.durataInputContainer}>
            <TextInput
              style={styles.durataInput}
              value={durataSettimane}
              onChangeText={setDurataSettimane}
              keyboardType="numeric"
            />
            <Text style={styles.durataLabel}>settimane</Text>
          </View>

          <TouchableOpacity
            style={styles.durataBtn}
            onPress={() => {
              const current = parseInt(durataSettimane) || 0;
              if (current < 52) setDurataSettimane((current + 1).toString());
            }}
          >
            <Text style={styles.durataBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.durataPresets}>
          {[4, 8, 12].map((weeks) => (
            <TouchableOpacity
              key={weeks}
              style={[
                styles.presetBtn,
                durataSettimane === weeks.toString() && styles.presetBtnActive,
              ]}
              onPress={() => setDurataSettimane(weeks.toString())}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  durataSettimane === weeks.toString() && styles.presetBtnTextActive,
                ]}
              >
                {weeks} sett.
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Dopo aver creato il programma, potrai aggiungere sessioni ed esercizi
          per ogni giorno della settimana.
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Crea programma"
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
  durataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durataBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durataBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  durataInputContainer: {
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
  },
  durataInput: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 80,
  },
  durataLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  durataPresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  presetBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  presetBtnTextActive: {
    color: COLORS.white,
  },
  infoCard: {
    margin: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.info}10`,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});

export default NuovoProgrammaScreen;
