// App ESSĒRE - Profilo Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ProfiloScreenProps {
  navigation: any;
}

export const ProfiloScreen: React.FC<ProfiloScreenProps> = ({ navigation }) => {
  const { user, updateUserProfile, signOut } = useAuth();

  const [nome, setNome] = useState(user?.nome || '');
  const [cognome, setCognome] = useState(user?.cognome || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  const getRuoloColor = () => {
    switch (user?.ruolo) {
      case 'titolare':
        return COLORS.titolare;
      case 'collaboratore':
        return COLORS.collaboratore;
      case 'allievo':
        return COLORS.allievo;
      default:
        return COLORS.primary;
    }
  };

  const getRuoloLabel = () => {
    switch (user?.ruolo) {
      case 'titolare':
        return 'Titolare';
      case 'collaboratore':
        return 'Collaboratore';
      case 'allievo':
        return 'Allievo';
      default:
        return '';
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || !cognome.trim()) {
      Alert.alert('Errore', 'Nome e cognome sono obbligatori');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        nome: nome.trim(),
        cognome: cognome.trim(),
        telefono: telefono.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      Alert.alert('Successo', 'Profilo aggiornato con successo');
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      Alert.alert('Errore', 'Impossibile aggiornare il profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const iniziali = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '??';

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getRuoloColor() }]}>
              <Text style={styles.avatarText}>{iniziali}</Text>
            </View>
          )}
          <View style={styles.editAvatarBtn}>
            <Text style={styles.editAvatarIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.ruoloBadge, { backgroundColor: `${getRuoloColor()}20` }]}>
          <Text style={[styles.ruoloText, { color: getRuoloColor() }]}>
            {getRuoloLabel()}
          </Text>
        </View>
      </View>

      {/* Info personali */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni personali</Text>

        <Input
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Il tuo nome"
        />

        <Input
          label="Cognome"
          value={cognome}
          onChangeText={setCognome}
          placeholder="Il tuo cognome"
        />

        <Input
          label="Telefono"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="+39 123 456 7890"
          keyboardType="phone-pad"
        />
      </Card>

      {/* Email (readonly) */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Credenziali</Text>

        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>Email</Text>
          <Text style={styles.readonlyValue}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => Alert.alert('Info', 'Funzionalità in arrivo')}
        >
          <Text style={styles.changePasswordText}>Cambia password</Text>
        </TouchableOpacity>
      </Card>

      {/* Info account */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Info account</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membro dal</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt?.toLocaleDateString('it-IT') || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ultimo aggiornamento</Text>
          <Text style={styles.infoValue}>
            {user?.updatedAt?.toLocaleDateString('it-IT') || 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Salva modifiche"
          onPress={handleSave}
          loading={loading}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutBtn}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  editAvatarIcon: {
    fontSize: 16,
  },
  ruoloBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  ruoloText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
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
  readonlyField: {
    marginBottom: SPACING.md,
  },
  readonlyLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  readonlyValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
  },
  changePasswordBtn: {
    alignSelf: 'flex-start',
  },
  changePasswordText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '500',
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
  logoutBtn: {
    marginTop: SPACING.md,
    borderColor: COLORS.error,
  },
});

export default ProfiloScreen;
