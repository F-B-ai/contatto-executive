import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/titolare/DashboardScreen';
import { CalendarioScreen } from '../screens/titolare/CalendarioScreen';
import { CollaboratoriScreen } from '../screens/titolare/CollaboratoriScreen';
import { AllieviScreen } from '../screens/titolare/AllieviScreen';
import { EconomiaScreen } from '../screens/titolare/EconomiaScreen';
import { TitolareTabParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator<TitolareTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20 }}>
    {label === 'Dashboard' && (focused ? '📊' : '📊')}
    {label === 'Calendario' && (focused ? '📅' : '📅')}
    {label === 'Collaboratori' && (focused ? '👥' : '👥')}
    {label === 'Allievi' && (focused ? '🏃' : '🏃')}
    {label === 'Economia' && (focused ? '💰' : '💰')}
  </Text>
);

export const TitolareNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: COLORS.titolare,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: COLORS.titolare,
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Calendario"
        component={CalendarioScreen}
        options={{ title: 'Calendario' }}
      />
      <Tab.Screen
        name="Collaboratori"
        component={CollaboratoriScreen}
        options={{ title: 'Collaboratori' }}
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
    </Tab.Navigator>
  );
};
