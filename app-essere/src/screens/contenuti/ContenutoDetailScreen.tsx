// App ESSĒRE - Contenuto Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Audio } from 'expo-av';
import { Loading, Card, Button } from '../../components/common';
import { getContenuto } from '../../services/contenutoService';
import { Contenuto, TipoContenuto } from '../../types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ContenutoDetailScreenProps {
  route: {
    params: {
      contenutoId: string;
    };
  };
  navigation: any;
}

export const ContenutoDetailScreen: React.FC<ContenutoDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { contenutoId } = route.params;
  const [loading, setLoading] = useState(true);
  const [contenuto, setContenuto] = useState<Contenuto | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadContenuto();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [contenutoId]);

  const loadContenuto = async () => {
    try {
      const data = await getContenuto(contenutoId);
      setContenuto(data);
    } catch (error) {
      console.error('Errore caricamento contenuto:', error);
    } finally {
      setLoading(false);
    }
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

  const handleOpenLink = async () => {
    if (!contenuto) return;

    const supported = await Linking.canOpenURL(contenuto.url);
    if (supported) {
      await Linking.openURL(contenuto.url);
    } else {
      Alert.alert('Errore', 'Impossibile aprire il link');
    }
  };

  const handlePlayPodcast = async () => {
    if (!contenuto) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: contenuto.url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Errore riproduzione audio:', error);
      Alert.alert('Errore', 'Impossibile riprodurre laudio');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  if (!contenuto) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Contenuto non trovato</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeIconLarge}>
          <Text style={styles.typeIconText}>{getTypeIcon(contenuto.tipo)}</Text>
        </View>
        <Text style={styles.tipo}>{contenuto.tipo.toUpperCase()}</Text>
        <Text style={styles.titolo}>{contenuto.titolo}</Text>
        <Text style={styles.categoria}>{contenuto.categoria}</Text>
      </View>

      {/* Video Player */}
      {contenuto.tipo === 'video' && (
        <Card style={styles.mediaCard}>
          <Video
            source={{ uri: contenuto.url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        </Card>
      )}

      {/* Podcast Player */}
      {contenuto.tipo === 'podcast' && (
        <Card style={styles.mediaCard}>
          <View style={styles.podcastPlayer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPodcast}
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>
            <Text style={styles.playLabel}>
              {isPlaying ? 'In riproduzione...' : 'Tocca per riprodurre'}
            </Text>
          </View>
        </Card>
      )}

      {/* Link/Document Button */}
      {(contenuto.tipo === 'link' || contenuto.tipo === 'documento') && (
        <Card style={styles.mediaCard}>
          <Button
            title={contenuto.tipo === 'link' ? 'Apri link' : 'Apri documento'}
            onPress={handleOpenLink}
          />
        </Card>
      )}

      {/* Descrizione */}
      <Card style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>Descrizione</Text>
        <Text style={styles.descrizione}>{contenuto.descrizione}</Text>
      </Card>

      {/* Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo</Text>
          <Text style={styles.infoValue}>{contenuto.tipo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Categoria</Text>
          <Text style={styles.infoValue}>{contenuto.categoria}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pubblicato il</Text>
          <Text style={styles.infoValue}>
            {contenuto.createdAt.toLocaleDateString('it-IT')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visibilità</Text>
          <Text style={styles.infoValue}>
            {contenuto.visibileA === 'tutti' ? 'Tutti gli allievi' : 'Specifici allievi'}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  typeIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  typeIconText: {
    fontSize: 40,
  },
  tipo: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  titolo: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categoria: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.7)',
  },
  mediaCard: {
    margin: SPACING.md,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: COLORS.black,
  },
  podcastPlayer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  playIcon: {
    fontSize: 32,
  },
  playLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  descriptionCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  descrizione: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  infoCard: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.xxl,
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
    textTransform: 'capitalize',
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

export default ContenutoDetailScreen;
