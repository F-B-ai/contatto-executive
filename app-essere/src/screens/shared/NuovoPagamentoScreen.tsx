// App ESSĒRE - Nuovo Pagamento Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button, Input, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Allievo, User, Collaboratore, ModalitaPagamento } from '../../types';
import {
  createPagamento,
  generaRate,
  calcolaGuadagni,
} from '../../services/paymentService';
import {
  getAllAllievi,
  getAllieviByCollaboratore,
  getUser,
  getCollaboratore,
} from '../../services/userService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

interface NuovoPagamentoScreenProps {
  onSuccess?: (pagamentoId: string) => void;
  onCancel?: () => void;
  preselectedAllievoId?: string;
}

export const NuovoPagamentoScreen: React.FC<NuovoPagamentoScreenProps> = ({
  onSuccess,
  onCancel,
  preselectedAllievoId,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedAllievoId, setSelectedAllievoId] = useState(preselectedAllievoId || '');
  const [descrizione, setDescrizione] = useState('');
  const [importoTotale, setImportoTotale] = useState('');
  const [modalita, setModalita] = useState<ModalitaPagamento>('unica');
  const [numeroRate, setNumeroRate] = useState('1');

  // Data
  const [allievi, setAllievi] = useState<(Allievo & { user?: User })[]>([]);
  const [percentualeCollaboratore, setPercentualeCollaboratore] = useState(50);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      let allieviData: Allievo[];
      if (user?.ruolo === 'titolare') {
        allieviData = await getAllAllievi();
      } else {
        allieviData = await getAllieviByCollaboratore(user!.id);

        // Carica la percentuale del collaboratore
        const collabData = await getCollaboratore(user!.id);
        if (collabData) {
          setPercentualeCollaboratore(collabData.percentuale);
        }
      }

      // Carica i dati utente
      const allieviWithUser = await Promise.all(
        allieviData.map(async (allievo) => {
          const userData = await getUser(allievo.userId);
          return { ...allievo, user: userData || undefined };
        })
      );

      setAllievi(allieviWithUser);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati');
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

    if (!descrizione.trim()) {
      Alert.alert('Errore', 'Inserisci una descrizione');
      return;
    }

    const importo = parseFloat(importoTotale.replace(',', '.'));
    if (isNaN(importo) || importo <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    const numRate = parseInt(numeroRate, 10);
    if (modalita === 'rate' && (isNaN(numRate) || numRate < 2 || numRate > 12)) {
      Alert.alert('Errore', 'Il numero di rate deve essere tra 2 e 12');
      return;
    }

    try {
      setSaving(true);

      const allievo = allievi.find((a) => a.userId === selectedAllievoId);
      const collaboratoreId = user?.ruolo === 'collaboratore'
        ? user.id
        : allievo?.collaboratoreId || '';

      // Genera le rate
      const rate = generaRate(
        importo,
        modalita === 'rate' ? numRate : 1,
        new Date()
      );

      const pagamentoId = await createPagamento({
        allievoId: selectedAllievoId,
        collaboratoreId,
        descrizione: descrizione.trim(),
        importoTotale: importo,
        modalita,
        rate,
        percentualeCollaboratore,
      });

      Alert.alert('Successo', 'Pagamento creato con successo!');
      onSuccess?.(pagamentoId);
    } catch (error) {
      console.error('Errore creazione pagamento:', error);
      Alert.alert('Errore', 'Impossibile creare il pagamento');
    } finally {
      setSaving(false);
    }
  };

  // Calcola anteprima guadagni
  const importo = parseFloat(importoTotale.replace(',', '.')) || 0;
  const { guadagnoCollaboratore, quotaTitolare } = calcolaGuadagni(importo, percentualeCollaboratore);

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nuovo Pagamento</Text>

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

      {/* Descrizione */}
      <Card style={styles.card}>
        <Input
          label="Descrizione"
          value={descrizione}
          onChangeText={setDescrizione}
          placeholder="Es: Pacchetto 10 sessioni"
        />
      </Card>

      {/* Importo */}
      <Card style={styles.card}>
        <Input
          label="Importo Totale (€)"
          value={importoTotale}
          onChangeText={setImportoTotale}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
      </Card>

      {/* Modalità pagamento */}
      <Card style={styles.card}>
        <Text style={styles.label}>Modalità di Pagamento</Text>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, modalita === 'unica' && styles.chipSelected]}
            onPress={() => {
              setModalita('unica');
              setNumeroRate('1');
            }}
          >
            <Text style={[styles.chipText, modalita === 'unica' && styles.chipTextSelected]}>
              Soluzione Unica
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, modalita === 'rate' && styles.chipSelected]}
            onPress={() => {
              setModalita('rate');
              setNumeroRate('3');
            }}
          >
            <Text style={[styles.chipText, modalita === 'rate' && styles.chipTextSelected]}>
              Rate
            </Text>
          </TouchableOpacity>
        </View>

        {modalita === 'rate' && (
          <View style={styles.rateSelector}>
            <Text style={styles.rateSelectorLabel}>Numero rate:</Text>
            <View style={styles.rateOptions}>
              {['2', '3', '4', '5', '6', '12'].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.rateChip,
                    numeroRate === n && styles.rateChipSelected,
                  ]}
                  onPress={() => setNumeroRate(n)}
                >
                  <Text
                    style={[
                      styles.rateChipText,
                      numeroRate === n && styles.rateChipTextSelected,
                    ]}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Anteprima guadagni */}
      {importo > 0 && (
        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>Riepilogo</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Importo totale</Text>
            <Text style={styles.previewValue}>{formatCurrency(importo)}</Text>
          </View>

          {modalita === 'rate' && (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Importo per rata</Text>
              <Text style={styles.previewValue}>
                {formatCurrency(importo / parseInt(numeroRate, 10))}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>
              Guadagno coach ({percentualeCollaboratore}%)
            </Text>
            <Text style={[styles.previewValue, { color: COLORS.collaboratore }]}>
              {formatCurrency(guadagnoCollaboratore)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>
              Quota titolare ({100 - percentualeCollaboratore}%)
            </Text>
            <Text style={[styles.previewValue, { color: COLORS.primary }]}>
              {formatCurrency(quotaTitolare)}
            </Text>
          </View>
        </Card>
      )}

      {/* Azioni */}
      <View style={styles.actions}>
        <Button
          title="Crea Pagamento"
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
  rateSelector: {
    marginTop: SPACING.md,
  },
  rateSelectorLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  rateOptions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  rateChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rateChipText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rateChipTextSelected: {
    color: COLORS.white,
  },
  previewCard: {
    backgroundColor: COLORS.primary + '05',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    marginBottom: SPACING.md,
  },
  previewTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  previewLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  previewValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});

export default NuovoPagamentoScreen;
