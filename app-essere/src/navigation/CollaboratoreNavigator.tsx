import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/collaboratore/HomeScreen';
import { CalendarioScreen } from '../screens/collaboratore/CalendarioScreen';
import { AllieviScreen } from '../screens/collaboratore/AllieviScreen';
import { EconomiaScreen } from '../screens/collaboratore/EconomiaScreen';
import { ProgrammiScreen } from '../screens/collaboratore/ProgrammiScreen';
import { CollaboratoreTabParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator<CollaboratoreTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20 }}>
    {label === 'Home' && (focused ? '🏠' : '🏠')}
    {label === 'Calendario' && (focused ? '📅' : '📅')}
    {label === 'Allievi' && (focused ? '🏃' : '🏃')}
    {label === 'Economia' && (focused ? '💰' : '💰')}
    {label === 'Programmi' && (focused ? '📋' : '📋')}
  </Text>
);

export const CollaboratoreNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: COLORS.collaboratore,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: COLORS.collaboratore,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          height: SIZES.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Allievi"
        component={AllieviScreen}
        options={{ title: 'I Miei Allievi' }}
      />
      <Tab.Screen
        name="Economia"
        component={EconomiaScreen}
        options={{ title: 'Economia' }}
      />
      <Tab.Screen
        name="Programmi"
        component={ProgrammiScreen}
        options={{ title: 'Programmi' }}
      />
    </Tab.Navigator>
  );
};
