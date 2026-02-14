import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { TitolareNavigator } from './TitolareNavigator';
import { CollaboratoreNavigator } from './CollaboratoreNavigator';
import { AllievoNavigator } from './AllievoNavigator';
import { Loading } from '../components/common';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Caricamento..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {user?.ruolo === 'titolare' && (
              <Stack.Screen name="Titolare" component={TitolareNavigator} />
            )}
            {user?.ruolo === 'collaboratore' && (
              <Stack.Screen name="Collaboratore" component={CollaboratoreNavigator} />
            )}
            {user?.ruolo === 'allievo' && (
              <Stack.Screen name="Allievo" component={AllievoNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
