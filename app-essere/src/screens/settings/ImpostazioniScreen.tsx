// App ESSĒRE - Impostazioni Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common';
import {
  getPreferenzeNotifiche,
  aggiornaPreferenzeNotifiche,
} from '../../services/notificheService';
import { APP_CONFIG, COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface ImpostazioniScreenProps {
  navigation: any;
}

export const ImpostazioniScreen: React.FC<ImpostazioniScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();

  const [notifiche, setNotifiche] = useState({
    sessioni: true,
    pagamenti: true,
    messaggi: true,
    contenuti: true,
  });

  useEffect(() => {
    loadPreferenze();
  }, []);

  const loadPreferenze = async () => {
    if (!user) return;

    try {
      const prefs = await getPreferenzeNotifiche(user.id);
      setNotifiche(prefs);
    } catch (error) {
      console.error('Errore caricamento preferenze:', error);
    }
  };

  const toggleNotifica = async (key: keyof typeof notifiche) => {
    if (!user) return;

    const newValue = !notifiche[key];
    setNotifiche({ ...notifiche, [key]: newValue });

    try {
      await aggiornaPreferenzeNotifiche(user.id, { [key]: newValue });
    } catch (error) {
      console.error('Errore aggiornamento preferenze:', error);
      // Rollback
      setNotifiche({ ...notifiche, [key]: !newValue });
    }
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  const ToggleItem = ({
    icon,
    title,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.success }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Notifiche */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifiche</Text>

        <ToggleItem
          icon="📅"
          title="Sessioni"
          value={notifiche.sessioni}
          onToggle={() => toggleNotifica('sessioni')}
        />
        <ToggleItem
          icon="💰"
          title="Pagamenti"
          value={notifiche.pagamenti}
          onToggle={() => toggleNotifica('pagamenti')}
        />
        <ToggleItem
          icon="💬"
          title="Messaggi"
          value={notifiche.messaggi}
          onToggle={() => toggleNotifica('messaggi')}
        />
        <ToggleItem
          icon="🎬"
          title="Nuovi contenuti"
          value={notifiche.contenuti}
          onToggle={() => toggleNotifica('contenuti')}
        />
      </Card>

      {/* Account */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <MenuItem
          icon="👤"
          title="Profilo"
          subtitle="Modifica i tuoi dati personali"
          onPress={() => navigation.navigate('Profilo')}
        />
        <MenuItem
          icon="🔒"
          title="Privacy e sicurezza"
          onPress={() => Alert.alert('Info', 'Funzionalità in arrivo')}
        />
      </Card>

      {/* Supporto */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Supporto</Text>

        <MenuItem
          icon="❓"
          title="FAQ"
          onPress={() => Alert.alert('Info', 'Funzionalità in arrivo')}
        />
        <MenuItem
          icon="📧"
          title="Contattaci"
          subtitle="Invia un'email di supporto"
          onPress={() => Linking.openURL('mailto:support@essere.app')}
        />
        <MenuItem
          icon="⭐"
          title="Valuta l'app"
          onPress={() => Alert.alert('Grazie!', 'La tua opinione è importante per noi')}
        />
      </Card>

      {/* Legale */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Legale</Text>

        <MenuItem
          icon="📋"
          title="Termini di servizio"
          onPress={() => Alert.alert('Info', 'Funzionalità in arrivo')}
        />
        <MenuItem
          icon="🔐"
          title="Privacy Policy"
          onPress={() => Alert.alert('Info', 'Funzionalità in arrivo')}
        />
      </Card>

      {/* Info app */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versione</Text>
          <Text style={styles.infoValue}>{APP_CONFIG.version}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bundle ID</Text>
          <Text style={styles.infoValue}>{APP_CONFIG.bundleId}</Text>
        </View>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {APP_CONFIG.name} - Versione {APP_CONFIG.version}
        </Text>
        <Text style={styles.footerCopyright}>
          © 2026 ESSĒRE. Tutti i diritti riservati.
        </Text>
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
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 28,
    textAlign: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  infoItem: {
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
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  footerCopyright: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDisabled,
  },
});

export default ImpostazioniScreen;
