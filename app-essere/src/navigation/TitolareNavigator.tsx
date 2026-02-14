// App ESSĒRE - Titolare Navigator (Owner)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { TitolareTabParamList, TitolareStackParamList } from './types';
import { COLORS, FONT_SIZE } from '../constants/theme';

// Screens
import { DashboardScreen, EconomiaScreen, SpeseScreen, CollaboratoriScreen } from '../screens/titolare';
import { CalendarScreen, AllieviScreen, PagamentiScreen, NuovaSessioneScreen, NuovoPagamentoScreen, SessioneDetailScreen } from '../screens/shared';
import { ChatListScreen, ChatScreen } from '../screens/chat';
import { ProfiloScreen, ImpostazioniScreen } from '../screens/settings';
import { TestPosturaleScreen, TestPosturaliListScreen } from '../screens/test-posturale';
import { ContenutiScreen, NuovoContenutoScreen, ContenutoDetailScreen } from '../screens/contenuti';
import { AllievoDetailScreen, NuovoAllievoScreen } from '../screens/allievi';
import { CollaboratoreDetailScreen, NuovoCollaboratoreScreen } from '../screens/collaboratori';
import { ProgrammiScreen, ProgrammaDetailScreen, NuovoProgrammaScreen } from '../screens/programmi';

const Tab = createBottomTabNavigator<TitolareTabParamList>();
const Stack = createNativeStackNavigator<TitolareStackParamList>();

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Calendario: '📅',
    Collaboratori: '👥',
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
        <MenuButton title="Contenuti" icon="🎬" onPress={() => navigation.navigate('Contenuti')} />
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
const TitolareTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Collaboratori"
        component={CollaboratoriScreen}
        options={{ title: 'Team' }}
      />
      <Tab.Screen
        name="Allievi"
        component={AllieviScreen}
        options={{ title: 'Allievi' }}
      />
      <Tab.Screen
        name="Economia"
        component={EconomiaScreen}
        options={{ title: 'Economia' }}
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
export const TitolareNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Indietro',
      }}
    >
      <Stack.Screen
        name="TitolareTabs"
        component={TitolareTabs}
        options={{ headerShown: false }}
      />

      {/* Dettagli */}
      <Stack.Screen name="CollaboratoreDetail" component={CollaboratoreDetailScreen} options={{ title: 'Collaboratore' }} />
      <Stack.Screen name="AllievoDetail" component={AllievoDetailScreen} options={{ title: 'Allievo' }} />
      <Stack.Screen name="SessioneDetail" component={SessioneDetailScreen} options={{ title: 'Sessione' }} />
      <Stack.Screen name="ProgrammaDetail" component={ProgrammaDetailScreen} options={{ title: 'Programma' }} />
      <Stack.Screen name="ContenutoDetail" component={ContenutoDetailScreen} options={{ title: 'Contenuto' }} />

      {/* Creazione */}
      <Stack.Screen name="NuovoCollaboratore" component={NuovoCollaboratoreScreen} options={{ title: 'Nuovo Collaboratore' }} />
      <Stack.Screen name="NuovoAllievo" component={NuovoAllievoScreen} options={{ title: 'Nuovo Allievo' }} />
      <Stack.Screen name="NuovaSessione" component={NuovaSessioneScreen} options={{ title: 'Nuova Sessione' }} />
      <Stack.Screen name="NuovoProgramma" component={NuovoProgrammaScreen} options={{ title: 'Nuovo Programma' }} />
      <Stack.Screen name="NuovaSpesa" component={SpeseScreen} options={{ title: 'Nuova Spesa' }} />
      <Stack.Screen name="NuovoContenuto" component={NuovoContenutoScreen} options={{ title: 'Nuovo Contenuto' }} />
      <Stack.Screen name="NuovoPagamento" component={NuovoPagamentoScreen} options={{ title: 'Nuovo Pagamento' }} />

      {/* Liste */}
      <Stack.Screen name="Programmi" component={ProgrammiScreen} options={{ title: 'Programmi' }} />
      <Stack.Screen name="Contenuti" component={ContenutiScreen} options={{ title: 'Contenuti' }} />
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

export default TitolareNavigator;
