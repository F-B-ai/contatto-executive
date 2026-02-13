// App ESSĒRE - Spese Screen (Titolare)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Card, Button, Input, Loading } from '../../components/common';
import { Spesa, CategoriaSpesa } from '../../types';
import {
  getAllSpese,
  createSpesa,
  deleteSpesa,
  CATEGORIE_SPESA,
} from '../../services/paymentService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface SpeseScreenProps {
  onSpesaPress?: (spesaId: string) => void;
}

export const SpeseScreen: React.FC<SpeseScreenProps> = ({ onSpesaPress }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [descrizione, setDescrizione] = useState('');
  const [importo, setImporto] = useState('');
  const [categoria, setCategoria] = useState<CategoriaSpesa>('altro');
  const [ricorrente, setRicorrente] = useState(false);

  const loadSpese = useCallback(async () => {
    try {
      const speseData = await getAllSpese();
      setSpese(speseData);
    } catch (error) {
      console.error('Errore caricamento spese:', error);
      Alert.alert('Errore', 'Impossibile caricare le spese');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSpese();
  }, [loadSpese]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSpese();
  };

  const resetForm = () => {
    setDescrizione('');
    setImporto('');
    setCategoria('altro');
    setRicorrente(false);
  };

  const handleSave = async () => {
    if (!descrizione.trim()) {
      Alert.alert('Errore', 'Inserisci una descrizione');
      return;
    }

    const importoNum = parseFloat(importo.replace(',', '.'));
    if (isNaN(importoNum) || importoNum <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    try {
      setSaving(true);

      await createSpesa({
        descrizione: descrizione.trim(),
        importo: importoNum,
        categoria,
        data: new Date(),
        ricorrente,
      });

      setShowModal(false);
      resetForm();
      loadSpese();
      Alert.alert('Successo', 'Spesa registrata!');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile registrare la spesa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (spesa: Spesa) => {
    Alert.alert(
      'Elimina Spesa',
      `Vuoi eliminare "${spesa.descrizione}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSpesa(spesa.id);
              loadSpese();
            } catch (error) {
              Alert.alert('Errore', 'Impossibile eliminare la spesa');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoriaLabel = (cat: CategoriaSpesa) => {
    return CATEGORIE_SPESA.find((c) => c.value === cat)?.label || cat;
  };

  const getCategoriaColor = (cat: CategoriaSpesa) => {
    const colors: Record<CategoriaSpesa, string> = {
      affitto: '#E91E63',
      attrezzature: '#9C27B0',
      marketing: '#2196F3',
      utenze: '#FF9800',
      personale: '#4CAF50',
      altro: '#607D8B',
    };
    return colors[cat];
  };

  // Calcola totale del mese
  const now = new Date();
  const speseMese = spese.filter((s) => {
    const data = new Date(s.data);
    return data.getMonth() === now.getMonth() && data.getFullYear() === now.getFullYear();
  });
  const totaleMese = speseMese.reduce((sum, s) => sum + s.importo, 0);

  const renderSpesa = ({ item }: { item: Spesa }) => {
    const color = getCategoriaColor(item.categoria);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => onSpesaPress?.(item.id)}
          onLongPress={() => handleDelete(item)}
        >
          <View style={[styles.categoryIndicator, { backgroundColor: color }]} />
          <View style={styles.spesaInfo}>
            <Text style={styles.spesaDescrizione}>{item.descrizione}</Text>
            <View style={styles.spesaMeta}>
              <Text style={styles.spesaCategoria}>{getCategoriaLabel(item.categoria)}</Text>
              <Text style={styles.spesaData}>{formatDate(item.data)}</Text>
            </View>
          </View>
          <View style={styles.spesaRight}>
            <Text style={styles.spesaImporto}>{formatCurrency(item.importo)}</Text>
            {item.ricorrente && (
              <Text style={styles.ricorrenteBadge}>Ricorrente</Text>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento spese..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con totale */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spese</Text>
          <Text style={styles.subtitle}>
            {now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.totaleContainer}>
          <Text style={styles.totaleLabel}>Totale mese</Text>
          <Text style={styles.totaleValue}>{formatCurrency(totaleMese)}</Text>
        </View>
      </View>

      <FlatList
        data={spese}
        renderItem={renderSpesa}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessuna spesa registrata</Text>
          </View>
        }
      />

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modal nuova spesa */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Annulla</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuova Spesa</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Descrizione"
              value={descrizione}
              onChangeText={setDescrizione}
              placeholder="Es: Affitto palestra"
            />

            <Input
              label="Importo (€)"
              value={importo}
              onChangeText={setImporto}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categorieGrid}>
              {CATEGORIE_SPESA.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoriaChip,
                    categoria === cat.value && styles.categoriaChipSelected,
                    { borderColor: getCategoriaColor(cat.value) },
                  ]}
                  onPress={() => setCategoria(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoriaChipText,
                      categoria === cat.value && { color: getCategoriaColor(cat.value) },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.ricorrenteRow}
              onPress={() => setRicorrente(!ricorrente)}
            >
              <View style={[styles.checkbox, ricorrente && styles.checkboxChecked]}>
                {ricorrente && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.ricorrenteLabel}>Spesa ricorrente (mensile)</Text>
            </TouchableOpacity>

            <Button
              title="Registra Spesa"
              onPress={handleSave}
              loading={saving}
              fullWidth
              style={styles.saveButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  totaleContainer: {
    alignItems: 'flex-end',
  },
  totaleLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  totaleValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.error,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: SPACING.sm,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  spesaInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  spesaDescrizione: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  spesaMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  spesaCategoria: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  spesaData: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  spesaRight: {
    alignItems: 'flex-end',
  },
  spesaImporto: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.error,
  },
  ricorrenteBadge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.info,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalContent: {
    padding: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  categorieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  categoriaChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
  },
  categoriaChipSelected: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
  },
  categoriaChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  ricorrenteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '700',
  },
  ricorrenteLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});

export default SpeseScreen;
