// App ESSĒRE - Forgot Password Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/common';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Email richiesta');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email non valida');
      return;
    }

    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Email inviata!</Text>
          <Text style={styles.successText}>
            Controlla la tua casella email e segui le istruzioni per reimpostare la password.
          </Text>
          <Button
            title="Torna al login"
            onPress={() => navigation.navigate('Login')}
            style={styles.successButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>ESSĒRE</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>Recupera Password</Text>
          <Text style={styles.description}>
            Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError('');
            }}
            placeholder="La tua email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error}
          />

          <Button
            title="Invia email di recupero"
            onPress={handleReset}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />
        </Card>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Torna al login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  card: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.md,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successIcon: {
    fontSize: 64,
    color: COLORS.success,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  successButton: {
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;
