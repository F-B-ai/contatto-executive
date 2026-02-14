import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/allievo/HomeScreen';
import { ProgrammaScreen } from '../screens/allievo/ProgrammaScreen';
import { CalendarioScreen } from '../screens/allievo/CalendarioScreen';
import { ContenutiScreen } from '../screens/allievo/ContenutiScreen';
import { ProfiloScreen } from '../screens/allievo/ProfiloScreen';
import { AllievoTabParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator<AllievoTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20 }}>
    {label === 'Home' && (focused ? '🏠' : '🏠')}
    {label === 'Programma' && (focused ? '💪' : '💪')}
    {label === 'Calendario' && (focused ? '📅' : '📅')}
    {label === 'Contenuti' && (focused ? '📚' : '📚')}
    {label === 'Profilo' && (focused ? '👤' : '👤')}
  </Text>
);

export const AllievoNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: COLORS.allievo,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: COLORS.allievo,
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
        name="Programma"
        component={ProgrammaScreen}
        options={{ title: 'Il Mio Programma' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Contenuti"
        component={ContenutiScreen}
        options={{ title: 'Contenuti' }}
      />
      <Tab.Screen
        name="Profilo"
        component={ProfiloScreen}
        options={{ title: 'Profilo' }}
      />
    </Tab.Navigator>
  );
};
