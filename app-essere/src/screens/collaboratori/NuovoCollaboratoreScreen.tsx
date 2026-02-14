// App ESSĒRE - Nuovo Collaboratore Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Input, Button } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface NuovoCollaboratoreScreenProps {
  navigation: any;
}

const SPECIALIZZAZIONI = [
  'Personal Training',
  'Nutrizione',
  'Posturale',
  'Riabilitazione',
  'Crossfit',
  'Yoga',
  'Pilates',
  'Functional Training',
  'Body Building',
  'Cardio',
];

export const NuovoCollaboratoreScreen: React.FC<NuovoCollaboratoreScreenProps> = ({
  navigation,
}) => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [percentuale, setPercentuale] = useState('50');
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSpecializzazione = (spec: string) => {
    if (specializzazioni.includes(spec)) {
      setSpecializzazioni(specializzazioni.filter((s) => s !== spec));
    } else {
      setSpecializzazioni([...specializzazioni, spec]);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || !cognome.trim() || !email.trim()) {
      Alert.alert('Errore', 'Nome, cognome e email sono obbligatori');
      return;
    }

    const perc = parseInt(percentuale);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      Alert.alert('Errore', 'La percentuale deve essere tra 0 e 100');
      return;
    }

    setLoading(true);
    try {
      // Qui dovremmo creare l'utente e il collaboratore
      // Per ora mostriamo solo un messaggio di successo
      Alert.alert(
        'Funzionalità',
        'La creazione di nuovi collaboratori richiede la configurazione di Firebase.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Errore creazione collaboratore:', error);
      Alert.alert('Errore', 'Impossibile creare il collaboratore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dati personali</Text>

        <Input
          label="Nome *"
          value={nome}
          onChangeText={setNome}
          placeholder="Nome del collaboratore"
        />

        <Input
          label="Cognome *"
          value={cognome}
          onChangeText={setCognome}
          placeholder="Cognome del collaboratore"
        />

        <Input
          label="Email *"
          value={email}
          onChangeText={setEmail}
          placeholder="email@esempio.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Telefono"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="+39 123 456 7890"
          keyboardType="phone-pad"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Percentuale guadagno</Text>
        <Text style={styles.sectionSubtitle}>
          Percentuale del totale pagamenti che spetta al collaboratore
        </Text>

        <View style={styles.percentualeContainer}>
          <Input
            value={percentuale}
            onChangeText={setPercentuale}
            keyboardType="numeric"
            style={styles.percentualeInput}
          />
          <Text style={styles.percentSymbol}>%</Text>
        </View>

        <View style={styles.percentualePresets}>
          {[40, 50, 60, 70].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.presetBtn,
                percentuale === p.toString() && styles.presetBtnActive,
              ]}
              onPress={() => setPercentuale(p.toString())}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  percentuale === p.toString() && styles.presetBtnTextActive,
                ]}
              >
                {p}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Specializzazioni</Text>
        <Text style={styles.sectionSubtitle}>
          Seleziona le aree di competenza del collaboratore
        </Text>

        <View style={styles.tagsContainer}>
          {SPECIALIZZAZIONI.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.tag,
                specializzazioni.includes(spec) && styles.tagSelected,
              ]}
              onPress={() => toggleSpecializzazione(spec)}
            >
              <Text
                style={[
                  styles.tagText,
                  specializzazioni.includes(spec) && styles.tagTextSelected,
                ]}
              >
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Crea collaboratore"
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
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  percentualeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentualeInput: {
    width: 100,
    fontSize: FONT_SIZE.xxl,
    textAlign: 'center',
    marginBottom: 0,
  },
  percentSymbol: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  percentualePresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
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
    backgroundColor: COLORS.collaboratore,
    borderColor: COLORS.collaboratore,
  },
  presetBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  presetBtnTextActive: {
    color: COLORS.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagSelected: {
    backgroundColor: COLORS.collaboratore,
    borderColor: COLORS.collaboratore,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  tagTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});

export default NuovoCollaboratoreScreen;
