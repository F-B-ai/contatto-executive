import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, isLoading } = useAuth();

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ruolo, setRuolo] = useState<UserRole>('allievo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) newErrors.nome = 'Nome obbligatorio';
    if (!cognome.trim()) newErrors.cognome = 'Cognome obbligatorio';
    if (!email) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email non valida';
    }
    if (!password) {
      newErrors.password = 'Password obbligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'Minimo 6 caratteri';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register(email, password, nome, cognome, ruolo);
    } catch (error) {
      Alert.alert('Errore', 'Registrazione fallita');
    }
  };

  const ruoloOptions: { value: UserRole; label: string; color: string }[] = [
    { value: 'allievo', label: 'Allievo', color: COLORS.allievo },
    { value: 'collaboratore', label: 'Collaboratore', color: COLORS.collaboratore },
    { value: 'titolare', label: 'Titolare', color: COLORS.titolare },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Crea Account</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Nome"
                value={nome}
                onChangeText={setNome}
                placeholder="Mario"
                autoCapitalize="words"
                error={errors.nome}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Cognome"
                value={cognome}
                onChangeText={setCognome}
                placeholder="Rossi"
                autoCapitalize="words"
                error={errors.cognome}
              />
            </View>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tuaemail@esempio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimo 6 caratteri"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Conferma Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ripeti la password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          {/* Ruolo selector */}
          <View style={styles.ruoloContainer}>
            <Text style={styles.ruoloLabel}>Ruolo</Text>
            <View style={styles.ruoloOptions}>
              {ruoloOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.ruoloOption,
                    ruolo === option.value && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setRuolo(option.value)}
                >
                  <Text
                    style={[
                      styles.ruoloOptionText,
                      ruolo === option.value && styles.ruoloOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Registrati"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={{ marginTop: SPACING.md }}
          />
        </View>
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
    padding: SPACING.lg,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  ruoloContainer: {
    marginBottom: SPACING.md,
  },
  ruoloLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  ruoloOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ruoloOption: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDERS.radiusMedium,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
  },
  ruoloOptionText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  ruoloOptionTextSelected: {
    color: COLORS.white,
  },
});
