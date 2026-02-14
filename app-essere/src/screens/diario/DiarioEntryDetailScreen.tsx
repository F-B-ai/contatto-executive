// App ESSĒRE - Diario Entry Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card, Button } from '../../components/common';
import { getDiarioEntry, eliminaDiarioEntry } from '../../services/diarioService';
import { DiarioEntry } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface DiarioEntryDetailScreenProps {
  route: {
    params: {
      entryId: string;
    };
  };
  navigation: any;
}

export const DiarioEntryDetailScreen: React.FC<DiarioEntryDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { entryId } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<DiarioEntry | null>(null);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      const data = await getDiarioEntry(entryId);
      setEntry(data);
    } catch (error) {
      console.error('Errore caricamento entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUmoreEmoji = (umore: number) => {
    if (umore >= 9) return '😄';
    if (umore >= 7) return '🙂';
    if (umore >= 5) return '😐';
    if (umore >= 3) return '😕';
    return '😢';
  };

  const getUmoreLabel = (umore: number) => {
    if (umore >= 9) return 'Ottimo';
    if (umore >= 7) return 'Bene';
    if (umore >= 5) return 'Così così';
    if (umore >= 3) return 'Male';
    return 'Molto male';
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina voce',
      'Sei sicuro di voler eliminare questa voce del diario?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminaDiarioEntry(entryId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Errore', 'Impossibile eliminare la voce');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Voce non trovata</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.date}>
          {entry.data.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <View style={styles.umoreContainer}>
          <Text style={styles.umoreEmoji}>{getUmoreEmoji(entry.umore)}</Text>
          <View style={styles.umoreInfo}>
            <Text style={styles.umoreValue}>{entry.umore}/10</Text>
            <Text style={styles.umoreLabel}>{getUmoreLabel(entry.umore)}</Text>
          </View>
        </View>
      </Card>

      {entry.note && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Note</Text>
          <Text style={styles.noteText}>{entry.note}</Text>
        </Card>
      )}

      {entry.immagini && entry.immagini.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Foto</Text>
          <View style={styles.immaginiGrid}>
            {entry.immagini.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))}
          </View>
        </Card>
      )}

      <Card style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Condiviso con trainer</Text>
          <Text style={styles.infoValue}>
            {entry.condiviso ? '✅ Sì' : '❌ No'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creato il</Text>
          <Text style={styles.infoValue}>
            {entry.createdAt.toLocaleString('it-IT')}
          </Text>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Elimina voce"
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteButton}
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
  headerCard: {
    margin: SPACING.md,
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginBottom: SPACING.lg,
  },
  umoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  umoreEmoji: {
    fontSize: 64,
    marginRight: SPACING.md,
  },
  umoreInfo: {
    alignItems: 'flex-start',
  },
  umoreValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.allievo,
  },
  umoreLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  noteText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  immaginiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginRight: '4%',
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  deleteButton: {
    borderColor: COLORS.error,
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

export default DiarioEntryDetailScreen;
