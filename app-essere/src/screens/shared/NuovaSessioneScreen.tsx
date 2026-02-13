// App ESSĒRE - Nuova Sessione Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, Button, Input, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { TipoSessione, User, Allievo } from '../../types';
import { createSessione } from '../../services/sessionService';
import { getAllAllievi, getAllieviByCollaboratore, getUser } from '../../services/userService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

interface NuovaSessioneScreenProps {
  onSuccess?: (sessioneId: string) => void;
  onCancel?: () => void;
  preselectedAllievoId?: string;
  preselectedDate?: Date;
}

export const NuovaSessioneScreen: React.FC<NuovaSessioneScreenProps> = ({
  onSuccess,
  onCancel,
  preselectedAllievoId,
  preselectedDate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedAllievoId, setSelectedAllievoId] = useState(preselectedAllievoId || '');
  const [data, setData] = useState(preselectedDate || new Date());
  const [ora, setOra] = useState(new Date());
  const [durata, setDurata] = useState('60');
  const [tipo, setTipo] = useState<TipoSessione>('allenamento');
  const [note, setNote] = useState('');

  // Data state
  const [allievi, setAllievi] = useState<(Allievo & { user?: User })[]>([]);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadAllievi();
  }, [user]);

  const loadAllievi = async () => {
    try {
      setLoading(true);

      let allieviData: Allievo[];
      if (user?.ruolo === 'titolare') {
        allieviData = await getAllAllievi();
      } else {
        allieviData = await getAllieviByCollaboratore(user!.id);
      }

      // Carica i dati utente per ogni allievo
      const allieviWithUser = await Promise.all(
        allieviData.map(async (allievo) => {
          const userData = await getUser(allievo.userId);
          return { ...allievo, user: userData || undefined };
        })
      );

      setAllievi(allieviWithUser);

      // Se c'è un allievo preselezionato, verifica che esista
      if (preselectedAllievoId) {
        const exists = allieviWithUser.some((a) => a.userId === preselectedAllievoId);
        if (!exists) {
          setSelectedAllievoId('');
        }
      }
    } catch (error) {
      console.error('Errore caricamento allievi:', error);
      Alert.alert('Errore', 'Impossibile caricare gli allievi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validazione
    if (!selectedAllievoId) {
      Alert.alert('Errore', 'Seleziona un allievo');
      return;
    }

    const durataNum = parseInt(durata, 10);
    if (isNaN(durataNum) || durataNum <= 0) {
      Alert.alert('Errore', 'Inserisci una durata valida');
      return;
    }

    // Combina data e ora
    const dataSessione = new Date(data);
    dataSessione.setHours(ora.getHours(), ora.getMinutes(), 0, 0);

    // Verifica che la data sia nel futuro
    if (dataSessione <= new Date()) {
      Alert.alert('Errore', 'La sessione deve essere programmata nel futuro');
      return;
    }

    try {
      setSaving(true);

      const allievo = allievi.find((a) => a.userId === selectedAllievoId);

      const sessioneId = await createSessione({
        allievoId: selectedAllievoId,
        collaboratoreId: user?.ruolo === 'collaboratore' ? user.id : allievo?.collaboratoreId || '',
        data: dataSessione,
        durata: durataNum,
        tipo,
        stato: 'programmata',
        noteCollaboratore: note || undefined,
      });

      Alert.alert('Successo', 'Sessione creata con successo!');
      onSuccess?.(sessioneId);
    } catch (error) {
      console.error('Errore creazione sessione:', error);
      Alert.alert('Errore', 'Impossibile creare la sessione');
    } finally {
      setSaving(false);
    }
  };

  const TIPI_SESSIONE: { value: TipoSessione; label: string }[] = [
    { value: 'allenamento', label: 'Allenamento' },
    { value: 'valutazione', label: 'Valutazione' },
    { value: 'consulenza_nutrizionale', label: 'Consulenza Nutrizionale' },
  ];

  const DURATE = ['30', '45', '60', '90', '120'];

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nuova Sessione</Text>

      {/* Selezione allievo */}
      <Card style={styles.card}>
        <Text style={styles.label}>Allievo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {allievi.map((allievo) => (
              <TouchableOpacity
                key={allievo.userId}
                style={[
                  styles.chip,
                  selectedAllievoId === allievo.userId && styles.chipSelected,
                ]}
                onPress={() => setSelectedAllievoId(allievo.userId)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedAllievoId === allievo.userId && styles.chipTextSelected,
                  ]}
                >
                  {allievo.user?.nome} {allievo.user?.cognome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Data e Ora */}
      <Card style={styles.card}>
        <Text style={styles.label}>Data e Ora</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonLabel}>Data</Text>
          <Text style={styles.dateButtonValue}>
            {data.toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateButtonLabel}>Ora</Text>
          <Text style={styles.dateButtonValue}>
            {ora.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={data}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setData(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={ora}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minuteInterval={15}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                setOra(selectedTime);
              }
            }}
          />
        )}
      </Card>

      {/* Durata */}
      <Card style={styles.card}>
        <Text style={styles.label}>Durata (minuti)</Text>
        <View style={styles.chipContainer}>
          {DURATE.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, durata === d && styles.chipSelected]}
              onPress={() => setDurata(d)}
            >
              <Text style={[styles.chipText, durata === d && styles.chipTextSelected]}>
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Tipo sessione */}
      <Card style={styles.card}>
        <Text style={styles.label}>Tipo di Sessione</Text>
        <View style={styles.chipContainer}>
          {TIPI_SESSIONE.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, tipo === t.value && styles.chipSelected]}
              onPress={() => setTipo(t.value)}
            >
              <Text style={[styles.chipText, tipo === t.value && styles.chipTextSelected]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Note */}
      <Card style={styles.card}>
        <Input
          label="Note (opzionale)"
          value={note}
          onChangeText={setNote}
          placeholder="Aggiungi note per la sessione..."
          multiline
          numberOfLines={3}
        />
      </Card>

      {/* Azioni */}
      <View style={styles.actions}>
        <Button
          title="Crea Sessione"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
        <Button
          title="Annulla"
          onPress={onCancel}
          variant="ghost"
          fullWidth
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
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateButtonLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  dateButtonValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});

export default NuovaSessioneScreen;
