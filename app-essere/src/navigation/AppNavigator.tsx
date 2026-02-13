// App ESSĒRE - Main App Navigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';
import { AuthNavigator } from './AuthNavigator';
import { RootStackParamList } from './types';

// Import home screens per ogni ruolo
import { DashboardScreen as TitolareDashboard } from '../screens/titolare';
import { HomeScreen as CollaboratoreHome } from '../screens/collaboratore';
import { HomeScreen as AllievoHome } from '../screens/allievo';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  // Determina quale navigator mostrare in base al ruolo
  const getHomeScreen = () => {
    if (!user) return null;

    switch (user.ruolo) {
      case 'titolare':
        return (
          <Stack.Screen
            name="Titolare"
            component={TitolareDashboard}
            options={{
              headerShown: true,
              title: 'Dashboard',
              headerLargeTitle: true,
            }}
          />
        );
      case 'collaboratore':
        return (
          <Stack.Screen
            name="Collaboratore"
            component={CollaboratoreHome}
            options={{
              headerShown: true,
              title: 'Home',
              headerLargeTitle: true,
            }}
          />
        );
      case 'allievo':
        return (
          <Stack.Screen
            name="Allievo"
            component={AllievoHome}
            options={{
              headerShown: true,
              title: 'Home',
              headerLargeTitle: true,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          getHomeScreen()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
