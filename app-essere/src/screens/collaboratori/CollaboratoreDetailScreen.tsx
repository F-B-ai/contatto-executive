// App ESSĒRE - Collaboratore Detail Screen
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
import { Loading, Card, Button, Input } from '../../components/common';
import { getUserById, getCollaboratoreById, updateCollaboratore, getAllieviByCollaboratore } from '../../services/userService';
import { getSessioniByCollaboratore } from '../../services/sessionService';
import { User, Collaboratore, Allievo, Sessione } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface CollaboratoreDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

export const CollaboratoreDetailScreen: React.FC<CollaboratoreDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [collaboratore, setCollaboratore] = useState<User | null>(null);
  const [collabData, setCollabData] = useState<Collaboratore | null>(null);
  const [allievi, setAllievi] = useState<(User & { allievoData?: Allievo })[]>([]);
  const [sessioni, setSessioni] = useState<Sessione[]>([]);
  const [editingPercentuale, setEditingPercentuale] = useState(false);
  const [nuovaPercentuale, setNuovaPercentuale] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [userData, collabInfo, sessioniData] = await Promise.all([
        getUserById(id),
        getCollaboratoreById(id),
        getSessioniByCollaboratore(id),
      ]);

      setCollaboratore(userData);
      setCollabData(collabInfo);
      setSessioni(sessioniData);

      if (collabInfo) {
        setNuovaPercentuale(collabInfo.percentuale.toString());
        const allieviData = await getAllieviByCollaboratore(collabInfo.id);
        setAllievi(allieviData as any);
      }
    } catch (error) {
      console.error('Errore caricamento dati collaboratore:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePercentuale = async () => {
    if (!collabData) return;

    const perc = parseInt(nuovaPercentuale);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      Alert.alert('Errore', 'La percentuale deve essere tra 0 e 100');
      return;
    }

    try {
      await updateCollaboratore(collabData.id, { percentuale: perc });
      setCollabData({ ...collabData, percentuale: perc });
      setEditingPercentuale(false);
      Alert.alert('Successo', 'Percentuale aggiornata');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiornare la percentuale');
    }
  };

  const getSessioniStats = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const questoMese = sessioni.filter(
      (s) => s.data >= startOfMonth && s.stato === 'completata'
    ).length;

    const totali = sessioni.filter((s) => s.stato === 'completata').length;

    return { questoMese, totali };
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  if (!collaboratore) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Collaboratore non trovato</Text>
      </View>
    );
  }

  const sessioniStats = getSessioniStats();
  const iniziali = `${collaboratore.nome.charAt(0)}${collaboratore.cognome.charAt(0)}`;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniziali}</Text>
        </View>
        <Text style={styles.nome}>{collaboratore.nome} {collaboratore.cognome}</Text>
        <Text style={styles.email}>{collaboratore.email}</Text>
        {collaboratore.telefono && (
          <Text style={styles.telefono}>{collaboratore.telefono}</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Chat', { partecipanteId: id })}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>Messaggio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('NuovoAllievo', { collaboratoreId: id })}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionLabel}>Aggiungi allievo</Text>
        </TouchableOpacity>
      </View>

      {/* Percentuale */}
      {currentUser?.ruolo === 'titolare' && collabData && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Percentuale guadagno</Text>
            {!editingPercentuale && (
              <TouchableOpacity onPress={() => setEditingPercentuale(true)}>
                <Text style={styles.editBtn}>Modifica</Text>
              </TouchableOpacity>
            )}
          </View>

          {editingPercentuale ? (
            <View style={styles.editRow}>
              <Input
                value={nuovaPercentuale}
                onChangeText={setNuovaPercentuale}
                keyboardType="numeric"
                style={styles.percentualeInput}
              />
              <Text style={styles.percentSymbol}>%</Text>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdatePercentuale}
              >
                <Text style={styles.saveBtnText}>Salva</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditingPercentuale(false);
                  setNuovaPercentuale(collabData.percentuale.toString());
                }}
              >
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.percentualeDisplay}>
              <Text style={styles.percentualeValue}>{collabData.percentuale}%</Text>
              <Text style={styles.percentualeLabel}>
                del totale pagamenti
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Statistiche */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiche</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allievi.length}</Text>
            <Text style={styles.statLabel}>Allievi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessioniStats.questoMese}</Text>
            <Text style={styles.statLabel}>Sessioni mese</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessioniStats.totali}</Text>
            <Text style={styles.statLabel}>Sessioni totali</Text>
          </View>
        </View>
      </Card>

      {/* Allievi */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Allievi ({allievi.length})</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NuovoAllievo', { collaboratoreId: id })}
          >
            <Text style={styles.addBtn}>+ Aggiungi</Text>
          </TouchableOpacity>
        </View>

        {allievi.length === 0 ? (
          <Text style={styles.emptyText}>Nessun allievo assegnato</Text>
        ) : (
          allievi.slice(0, 5).map((allievo) => (
            <TouchableOpacity
              key={allievo.id}
              style={styles.allievoItem}
              onPress={() => navigation.navigate('AllievoDetail', { id: allievo.id })}
            >
              <View style={styles.allievoAvatar}>
                <Text style={styles.allievoInitials}>
                  {allievo.nome.charAt(0)}{allievo.cognome.charAt(0)}
                </Text>
              </View>
              <View style={styles.allievoInfo}>
                <Text style={styles.allievoNome}>
                  {allievo.nome} {allievo.cognome}
                </Text>
                <Text style={styles.allievoEmail}>{allievo.email}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>

      {/* Specializzazioni */}
      {collabData && collabData.specializzazioni.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Specializzazioni</Text>
          <View style={styles.tagsContainer}>
            {collabData.specializzazioni.map((spec, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{spec}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.collaboratore,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  nome: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
  },
  telefono: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editBtn: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addBtn: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.collaboratore,
    fontWeight: '500',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentualeInput: {
    width: 80,
    marginBottom: 0,
  },
  percentSymbol: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    marginLeft: 4,
    marginRight: SPACING.md,
  },
  saveBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
  },
  percentualeDisplay: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  percentualeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.collaboratore,
  },
  percentualeLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  allievoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  allievoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.allievo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  allievoInitials: {
    color: COLORS.white,
    fontWeight: '600',
  },
  allievoInfo: {
    flex: 1,
  },
  allievoNome: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  allievoEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: `${COLORS.collaboratore}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.collaboratore,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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

export default CollaboratoreDetailScreen;
