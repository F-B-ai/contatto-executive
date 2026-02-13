// App ESSĒRE - Register Screen
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
import { UserRole } from '../../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    ruolo: 'allievo' as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome richiesto';
    }

    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Cognome richiesto';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimo 6 caratteri';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await signUp(formData.email.trim().toLowerCase(), formData.password, {
        email: formData.email.trim().toLowerCase(),
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
        telefono: formData.telefono.trim() || undefined,
        ruolo: formData.ruolo,
      });
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  const RoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={styles.roleLabel}>Tipo di account</Text>
      <View style={styles.roleButtons}>
        {(['allievo', 'collaboratore'] as UserRole[]).map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleButton,
              formData.ruolo === role && styles.roleButtonActive,
            ]}
            onPress={() => updateField('ruolo', role)}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.ruolo === role && styles.roleButtonTextActive,
              ]}
            >
              {role === 'allievo' ? 'Allievo' : 'Coach'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          <Text style={styles.subtitle}>Crea il tuo account</Text>
        </View>

        <Card style={styles.card}>
          <RoleSelector />

          <View style={styles.row}>
            <Input
              label="Nome"
              value={formData.nome}
              onChangeText={(v) => updateField('nome', v)}
              placeholder="Il tuo nome"
              error={errors.nome}
              containerStyle={styles.halfInput}
            />
            <Input
              label="Cognome"
              value={formData.cognome}
              onChangeText={(v) => updateField('cognome', v)}
              placeholder="Il tuo cognome"
              error={errors.cognome}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="La tua email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Telefono (opzionale)"
            value={formData.telefono}
            onChangeText={(v) => updateField('telefono', v)}
            placeholder="+39 123 456 7890"
            keyboardType="phone-pad"
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            placeholder="Crea una password"
            isPassword
            error={errors.password}
          />

          <Input
            label="Conferma Password"
            value={formData.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            placeholder="Ripeti la password"
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Registrati"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Accedi</Text>
          </TouchableOpacity>
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
    paddingTop: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    padding: SPACING.lg,
  },
  roleContainer: {
    marginBottom: SPACING.lg,
  },
  roleLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  roleButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default RegisterScreen;
