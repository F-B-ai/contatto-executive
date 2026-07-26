import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#C1121F',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Valentina - Bot Manager',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: 'Dashboard',
          }}
        />
        <Stack.Screen
          name="conversation"
          options={{
            title: 'Conversazione',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
