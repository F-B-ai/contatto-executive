// App ESSĒRE - Allievo Navigator (Client)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { AllievoTabParamList, AllievoStackParamList } from './types';
import { COLORS, FONT_SIZE } from '../constants/theme';

// Screens
import { HomeScreen as AllievoHome } from '../screens/allievo';
import { CalendarScreen, PagamentiScreen, SessioneDetailScreen } from '../screens/shared';
import { ChatListScreen, ChatScreen } from '../screens/chat';
import { ProfiloScreen, ImpostazioniScreen } from '../screens/settings';
import { ContenutiScreen, ContenutoDetailScreen } from '../screens/contenuti';
import { DiarioScreen, NuovaDiarioEntryScreen, DiarioEntryDetailScreen } from '../screens/diario';
import { TestPosturaliListScreen, TestPosturaleDetailScreen } from '../screens/test-posturale';
import { ProgrammaAllievoScreen, EsercizioDetailScreen } from '../screens/programmi';

const Tab = createBottomTabNavigator<AllievoTabParamList>();
const Stack = createNativeStackNavigator<AllievoStackParamList>();

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Programma: '📋',
    Calendario: '📅',
    Contenuti: '🎬',
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
        <Text style={styles.menuSectionTitle}>Il Mio Percorso</Text>
        <MenuButton title="Diario" icon="📔" onPress={() => navigation.navigate('Diario')} />
        <MenuButton title="Test Posturali" icon="🧍" onPress={() => navigation.navigate('TestPosturali')} />
        <MenuButton title="Pagamenti" icon="💳" onPress={() => navigation.navigate('Pagamenti')} />
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
const AllievoTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.allievo,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        headerStyle: { backgroundColor: COLORS.allievo },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={AllievoHome}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Programma"
        component={ProgrammaAllievoScreen}
        options={{ title: 'Programma' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Contenuti"
        component={ContenutiScreen}
        options={{ title: 'Contenuti' }}
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
export const AllievoNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.allievo },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Indietro',
      }}
    >
      <Stack.Screen
        name="AllievoTabs"
        component={AllievoTabs}
        options={{ headerShown: false }}
      />

      {/* Dettagli */}
      <Stack.Screen name="SessioneDetail" component={SessioneDetailScreen} options={{ title: 'Sessione' }} />
      <Stack.Screen name="EsercizioDetail" component={EsercizioDetailScreen} options={{ title: 'Esercizio' }} />
      <Stack.Screen name="ContenutoDetail" component={ContenutoDetailScreen} options={{ title: 'Contenuto' }} />
      <Stack.Screen name="DiarioEntryDetail" component={DiarioEntryDetailScreen} options={{ title: 'Diario' }} />
      <Stack.Screen name="TestPosturaleDetail" component={TestPosturaleDetailScreen} options={{ title: 'Test Posturale' }} />

      {/* Diario */}
      <Stack.Screen name="Diario" component={DiarioScreen} options={{ title: 'Il Mio Diario' }} />
      <Stack.Screen name="NuovaDiarioEntry" component={NuovaDiarioEntryScreen} options={{ title: 'Nuova Voce' }} />

      {/* Liste */}
      <Stack.Screen name="Pagamenti" component={PagamentiScreen} options={{ title: 'I Miei Pagamenti' }} />
      <Stack.Screen name="TestPosturali" component={TestPosturaliListScreen} options={{ title: 'Test Posturali' }} />

      {/* Chat */}
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messaggi' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />

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

export default AllievoNavigator;
