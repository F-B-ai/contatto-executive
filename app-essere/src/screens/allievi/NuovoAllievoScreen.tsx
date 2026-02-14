// App ESSĒRE - Nuovo Allievo Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components/common';
import { createAllievo, getAllCollaboratori } from '../../services/userService';
import { Collaboratore, User } from '../../types';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface NuovoAllievoScreenProps {
  route?: {
    params?: {
      collaboratoreId?: string;
    };
  };
  navigation: any;
}

export const NuovoAllievoScreen: React.FC<NuovoAllievoScreenProps> = ({
  route,
  navigation,
}) => {
  const preselectedCollabId = route?.params?.collaboratoreId;
  const { user } = useAuth();

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [collaboratoreId, setCollaboratoreId] = useState(preselectedCollabId || '');
  const [obiettivo, setObiettivo] = useState('');
  const [note, setNote] = useState('');
  const [collaboratori, setCollaboratori] = useState<(Collaboratore & { user?: User })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCollaboratori();
  }, []);

  const loadCollaboratori = async () => {
    try {
      const collabs = await getAllCollaboratori();
      setCollaboratori(collabs as any);

      // Se è un collaboratore, preseleziona se stesso
      if (user?.ruolo === 'collaboratore' && !preselectedCollabId) {
        const selfCollab = collabs.find((c) => c.userId === user.id);
        if (selfCollab) {
          setCollaboratoreId(selfCollab.id);
        }
      }
    } catch (error) {
      console.error('Errore caricamento collaboratori:', error);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || !cognome.trim() || !email.trim()) {
      Alert.alert('Errore', 'Nome, cognome e email sono obbligatori');
      return;
    }

    if (!collaboratoreId && user?.ruolo === 'titolare') {
      Alert.alert('Errore', 'Seleziona un collaboratore');
      return;
    }

    setLoading(true);
    try {
      // Qui dovremmo creare l'utente e l'allievo
      // Per ora mostriamo solo un messaggio di successo
      Alert.alert(
        'Funzionalità',
        'La creazione di nuovi allievi richiede la configurazione di Firebase.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Errore creazione allievo:', error);
      Alert.alert('Errore', 'Impossibile creare l\'allievo');
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
          placeholder="Nome dell'allievo"
        />

        <Input
          label="Cognome *"
          value={cognome}
          onChangeText={setCognome}
          placeholder="Cognome dell'allievo"
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

      {user?.ruolo === 'titolare' && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Assegna a collaboratore</Text>

          <View style={styles.collaboratoriGrid}>
            {collaboratori.map((collab) => (
              <TouchableOpacity
                key={collab.id}
                style={[
                  styles.collaboratoreOption,
                  collaboratoreId === collab.id && styles.collaboratoreSelected,
                ]}
                onPress={() => setCollaboratoreId(collab.id)}
              >
                <View style={styles.collaboratoreAvatar}>
                  <Text style={styles.collaboratoreInitials}>
                    {collab.userId.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.collaboratoreNome}>
                  Collaboratore {collab.id.substring(0, 4)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Obiettivi e note</Text>

        <Input
          label="Obiettivo"
          value={obiettivo}
          onChangeText={setObiettivo}
          placeholder="Es: Perdere peso, tonificare..."
        />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Note</Text>
          <TouchableOpacity
            style={styles.textArea}
            onPress={() => {}}
          >
            <Text style={note ? styles.textAreaText : styles.textAreaPlaceholder}>
              {note || 'Note aggiuntive sull\'allievo...'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Crea allievo"
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
  collaboratoriGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  collaboratoreOption: {
    width: '48%',
    marginRight: '4%',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  collaboratoreSelected: {
    borderColor: COLORS.collaboratore,
    backgroundColor: `${COLORS.collaboratore}10`,
  },
  collaboratoreAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.collaboratore,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  collaboratoreInitials: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  collaboratoreNome: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    textAlign: 'center',
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
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textAreaText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  textAreaPlaceholder: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});

export default NuovoAllievoScreen;
