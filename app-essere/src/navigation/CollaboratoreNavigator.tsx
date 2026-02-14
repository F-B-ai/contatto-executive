// App ESSĒRE - Collaboratore Navigator (Trainer)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { CollaboratoreTabParamList, CollaboratoreStackParamList } from './types';
import { COLORS, FONT_SIZE } from '../constants/theme';

// Screens
import { HomeScreen as CollaboratoreHome } from '../screens/collaboratore';
import { CalendarScreen, AllieviScreen, PagamentiScreen, NuovaSessioneScreen, SessioneDetailScreen } from '../screens/shared';
import { ChatListScreen, ChatScreen } from '../screens/chat';
import { ProfiloScreen, ImpostazioniScreen } from '../screens/settings';
import { TestPosturaleScreen, TestPosturaliListScreen } from '../screens/test-posturale';
import { AllievoDetailScreen, NuovoAllievoScreen } from '../screens/allievi';
import { ProgrammiScreen, ProgrammaDetailScreen, NuovoProgrammaScreen } from '../screens/programmi';
import { EconomiaCollaboratoreScreen } from '../screens/collaboratore';

const Tab = createBottomTabNavigator<CollaboratoreTabParamList>();
const Stack = createNativeStackNavigator<CollaboratoreStackParamList>();

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Calendario: '📅',
    Allievi: '🏃',
    Economia: '💰',
    Altro: '⋯',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '●'}
      </Text>
    </View>
  );
};

// Altro Stack per menu aggiuntivo
const AltroScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.altroContainer}>
      <Text style={styles.altroTitle}>Altro</Text>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Gestione</Text>
        <MenuButton title="Programmi" icon="📋" onPress={() => navigation.navigate('Programmi')} />
        <MenuButton title="Test Posturali" icon="🧍" onPress={() => navigation.navigate('TestPosturali')} />
        <MenuButton title="Chat" icon="💬" onPress={() => navigation.navigate('ChatList')} />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <MenuButton title="Profilo" icon="👤" onPress={() => navigation.navigate('Profilo')} />
        <MenuButton title="Impostazioni" icon="⚙️" onPress={() => navigation.navigate('Impostazioni')} />
      </View>
    </View>
  );
};

const MenuButton = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
  <View style={styles.menuButton}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuText} onPress={onPress}>{title}</Text>
  </View>
);

// Tab Navigator
const CollaboratoreTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.collaboratore,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        headerStyle: { backgroundColor: COLORS.collaboratore },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CollaboratoreHome}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Allievi"
        component={AllieviScreen}
        options={{ title: 'I Miei Allievi' }}
      />
      <Tab.Screen
        name="Economia"
        component={EconomiaCollaboratoreScreen}
        options={{ title: 'Guadagni' }}
      />
      <Tab.Screen
        name="Altro"
        component={AltroScreen}
        options={{ title: 'Altro' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
export const CollaboratoreNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.collaboratore },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Indietro',
      }}
    >
      <Stack.Screen
        name="CollaboratoreTabs"
        component={CollaboratoreTabs}
        options={{ headerShown: false }}
      />

      {/* Dettagli */}
      <Stack.Screen name="AllievoDetail" component={AllievoDetailScreen} options={{ title: 'Allievo' }} />
      <Stack.Screen name="SessioneDetail" component={SessioneDetailScreen} options={{ title: 'Sessione' }} />
      <Stack.Screen name="ProgrammaDetail" component={ProgrammaDetailScreen} options={{ title: 'Programma' }} />

      {/* Creazione */}
      <Stack.Screen name="NuovaSessione" component={NuovaSessioneScreen} options={{ title: 'Nuova Sessione' }} />
      <Stack.Screen name="NuovoProgramma" component={NuovoProgrammaScreen} options={{ title: 'Nuovo Programma' }} />
      <Stack.Screen name="NuovoAllievo" component={NuovoAllievoScreen} options={{ title: 'Nuovo Allievo' }} />

      {/* Liste */}
      <Stack.Screen name="Programmi" component={ProgrammiScreen} options={{ title: 'Programmi' }} />
      <Stack.Screen name="Pagamenti" component={PagamentiScreen} options={{ title: 'Pagamenti' }} />
      <Stack.Screen name="TestPosturali" component={TestPosturaliListScreen} options={{ title: 'Test Posturali' }} />

      {/* Chat */}
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messaggi' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />

      {/* Test Posturale */}
      <Stack.Screen name="TestPosturale" component={TestPosturaleScreen} options={{ title: 'Test Posturale' }} />

      {/* Impostazioni */}
      <Stack.Screen name="Profilo" component={ProfiloScreen} options={{ title: 'Profilo' }} />
      <Stack.Screen name="Impostazioni" component={ImpostazioniScreen} options={{ title: 'Impostazioni' }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
    paddingBottom: 4,
    height: 60,
  },
  altroContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  altroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});

export default CollaboratoreNavigator;
