import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { UserRole, User } from '@etulamaan/shared-types';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { secureStore } from '../../services/secureStore';
import { apiFetch } from '../../services/api';

interface TwoFactorScreenProps {
  userId: string;
  onVerifySuccess: (user: User, role: UserRole) => void;
  onCancel: () => void;
}

export const TwoFactorScreen: React.FC<TwoFactorScreenProps> = ({ userId, onVerifySuccess, onCancel }) => {
  const { isDark } = useTheme();
  const [code, setCode] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await res.json();

      if (res.ok) {
        await secureStore.setItem('authToken', data.token);
        onVerifySuccess(data.user, 'LMO');
      } else {
        Alert.alert('2FA Failed', data.error?.message || 'Invalid code');
      }
    } catch (err) {
      Alert.alert('Error', 'Verification request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('auth.twoFactorHeader')}</Text>
        <Text style={styles.sub}>{t('auth.twoFactorSubtitle')}</Text>

        <TextInput
          style={[styles.codeInput, isDark && styles.darkInput]}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor="#94A3B8"
        />

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.verifyBtnText}>{t('auth.verifyBtn')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, justifyContent: 'center', padding: 20 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, alignItems: 'center', elevation: 3 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.navy, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: colors.gray, textAlign: 'center', marginBottom: 20 },
  darkText: { color: colors.darkTheme.textPrimary },
  codeInput: { backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: colors.blue, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, fontSize: 24, fontWeight: 'bold', letterSpacing: 8, textAlign: 'center', marginBottom: 20, width: '80%' },
  darkInput: { backgroundColor: '#0F172A', color: '#FFF' },
  verifyBtn: { backgroundColor: colors.blue, width: '100%', paddingVertical: 14, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  verifyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { paddingVertical: 10 },
  cancelBtnText: { color: colors.gray, fontWeight: '600' }
});
