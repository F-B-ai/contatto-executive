// App ESSĒRE - Main App Navigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';
import { AuthNavigator } from './AuthNavigator';
import { TitolareNavigator } from './TitolareNavigator';
import { CollaboratoreNavigator } from './CollaboratoreNavigator';
import { AllievoNavigator } from './AllievoNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  // Determina quale navigator mostrare in base al ruolo
  const getHomeNavigator = () => {
    if (!user) return null;

    switch (user.ruolo) {
      case 'titolare':
        return (
          <Stack.Screen
            name="Titolare"
            component={TitolareNavigator}
            options={{ headerShown: false }}
          />
        );
      case 'collaboratore':
        return (
          <Stack.Screen
            name="Collaboratore"
            component={CollaboratoreNavigator}
            options={{ headerShown: false }}
          />
        );
      case 'allievo':
        return (
          <Stack.Screen
            name="Allievo"
            component={AllievoNavigator}
            options={{ headerShown: false }}
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
          getHomeNavigator()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
