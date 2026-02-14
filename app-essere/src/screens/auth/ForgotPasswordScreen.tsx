import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Email obbligatoria');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email non valida');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      Alert.alert('Errore', 'Impossibile inviare email di reset');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.title}>Email Inviata!</Text>
          <Text style={styles.description}>
            Controlla la tua casella email per le istruzioni su come reimpostare la password.
          </Text>
          <Button
            title="Torna al Login"
            onPress={() => navigation.goBack()}
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recupera Password</Text>
        <Text style={styles.description}>
          Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tuaemail@esempio.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
        />

        <Button
          title="Invia Email"
          onPress={handleReset}
          loading={isLoading}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
