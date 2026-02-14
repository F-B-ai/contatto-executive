// App ESSĒRE - Contenuti Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Loading, Card } from '../../components/common';
import { getAllContenuti, getContenutiPerAllievo, CATEGORIE_CONTENUTI } from '../../services/contenutoService';
import { Contenuto, TipoContenuto } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ContenutiScreenProps {
  navigation: any;
}

export const ContenutiScreen: React.FC<ContenutiScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contenuti, setContenuti] = useState<Contenuto[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoContenuto | 'tutti'>('tutti');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Tutti');

  const loadContenuti = async () => {
    if (!user) return;

    try {
      const data = user.ruolo === 'allievo'
        ? await getContenutiPerAllievo(user.id)
        : await getAllContenuti();

      setContenuti(data);
    } catch (error) {
      console.error('Errore caricamento contenuti:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContenuti();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContenuti();
  };

  const getTypeIcon = (tipo: TipoContenuto) => {
    switch (tipo) {
      case 'video':
        return '🎬';
      case 'podcast':
        return '🎙️';
      case 'documento':
        return '📄';
      case 'link':
        return '🔗';
      default:
        return '📁';
    }
  };

  const getTypeColor = (tipo: TipoContenuto) => {
    switch (tipo) {
      case 'video':
        return COLORS.error;
      case 'podcast':
        return COLORS.info;
      case 'documento':
        return COLORS.success;
      case 'link':
        return COLORS.secondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const filteredContenuti = contenuti.filter((c) => {
    if (filtroTipo !== 'tutti' && c.tipo !== filtroTipo) return false;
    if (filtroCategoria !== 'Tutti' && c.categoria !== filtroCategoria) return false;
    return true;
  });

  const renderContenuto = ({ item }: { item: Contenuto }) => (
    <TouchableOpacity
      style={styles.contenutoCard}
      onPress={() => navigation.navigate('ContenutoDetail', { contenutoId: item.id })}
    >
      <View style={[styles.typeIcon, { backgroundColor: `${getTypeColor(item.tipo)}20` }]}>
        <Text style={styles.typeIconText}>{getTypeIcon(item.tipo)}</Text>
      </View>

      <View style={styles.contenutoInfo}>
        <Text style={styles.contenutoTitolo}>{item.titolo}</Text>
        <Text style={styles.contenutoDescrizione} numberOfLines={2}>
          {item.descrizione}
        </Text>
        <View style={styles.contenutoMeta}>
          <Text style={[styles.tipoBadge, { color: getTypeColor(item.tipo) }]}>
            {item.tipo.toUpperCase()}
          </Text>
          <Text style={styles.categoria}>{item.categoria}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const tipiContenuto: (TipoContenuto | 'tutti')[] = ['tutti', 'video', 'podcast', 'documento', 'link'];

  if (loading) {
    return <Loading fullScreen text="Caricamento contenuti..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filtri Tipo */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tipiContenuto}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filtroTipo === item && styles.filterChipActive,
              ]}
              onPress={() => setFiltroTipo(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filtroTipo === item && styles.filterChipTextActive,
                ]}
              >
                {item === 'tutti' ? 'Tutti' : `${getTypeIcon(item)} ${item}`}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Lista contenuti */}
      {filteredContenuti.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyTitle}>Nessun contenuto</Text>
          <Text style={styles.emptyText}>
            {user?.ruolo === 'allievo'
              ? 'Non ci sono contenuti disponibili per te'
              : 'Non hai ancora creato contenuti'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContenuti}
          renderItem={renderContenuto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {user?.ruolo !== 'allievo' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('NuovoContenuto')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterList: {
    padding: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: SPACING.md,
  },
  contenutoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  typeIconText: {
    fontSize: 24,
  },
  contenutoInfo: {
    flex: 1,
  },
  contenutoTitolo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  contenutoDescrizione: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  contenutoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginRight: SPACING.md,
  },
  categoria: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.white,
  },
});

export default ContenutiScreen;
