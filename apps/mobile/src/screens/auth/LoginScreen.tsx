import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../../packages/ui-kit/src';
import { UserRole, User } from '../../../../packages/shared-types/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { secureStore } from '../../services/secureStore';

interface LoginScreenProps {
  onLoginSuccess: (user: User, role: UserRole) => void;
  onNavigate2FA: (userId: string) => void;
  onNavigateRegister: () => void;
  onNavigatePublic: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigate2FA,
  onNavigateRegister,
  onNavigatePublic
}) => {
  const { isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner');
  const [email, setEmail] = useState('rajesh.traders@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loginEmail = selectedRole === 'LMO' ? 'v.sharma@lm.gov.in' : email;
      const res = await fetch('http://localhost:4000/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password, role: selectedRole })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.require2FA) {
          onNavigate2FA(data.userId);
        } else {
          await secureStore.setItem('authToken', data.token);
          onLoginSuccess(data.user, selectedRole);
        }
      } else {
        Alert.alert('Login Failed', data.error?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Network Error', 'Failed to reach authentication service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.brandHeader}>
        <Text style={styles.brandTitle}>{t('appName')}</Text>
        <Text style={styles.brandSub}>{t('appTagline')}</Text>
      </View>

      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('auth.selectRole')}</Text>
      
      <View style={styles.roleTabs}>
        <TouchableOpacity
          style={[styles.roleTab, selectedRole === 'Owner' && styles.activeTab]}
          onPress={() => { setSelectedRole('Owner'); setEmail('rajesh.traders@example.com'); }}
        >
          <Text style={[styles.roleTabText, selectedRole === 'Owner' && styles.activeTabText]}>
            👤 {t('roles.owner')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, selectedRole === 'LMO' && styles.activeTab]}
          onPress={() => { setSelectedRole('LMO'); setEmail('v.sharma@lm.gov.in'); }}
        >
          <Text style={[styles.roleTabText, selectedRole === 'LMO' && styles.activeTabText]}>
            🛡️ {t('roles.lmo')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.publicCtaCard} onPress={onNavigatePublic}>
        <Text style={styles.publicCtaTitle}>🔍 {t('roles.public')}</Text>
        <Text style={styles.publicCtaSub}>No login required — Instant QR verification</Text>
      </TouchableOpacity>

      <View style={[styles.formCard, isDark && styles.darkCard]}>
        <Text style={[styles.formTitle, isDark && styles.darkText]}>
          {selectedRole === 'LMO' ? 'LMO Official Sign In' : t('auth.loginHeader')}
        </Text>

        <Text style={[styles.label, isDark && styles.darkText]}>{t('auth.emailLabel')}</Text>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          value={selectedRole === 'LMO' ? 'v.sharma@lm.gov.in' : email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor="#94A3B8"
        />

        <Text style={[styles.label, isDark && styles.darkText]}>{t('auth.passwordLabel')}</Text>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
        />

        {selectedRole === 'LMO' && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>🔒 Mandatory 2FA will be prompted after password verification (ADR-004).</Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{t('auth.loginBtn')}</Text>}
        </TouchableOpacity>

        {selectedRole === 'Owner' && (
          <TouchableOpacity style={styles.registerLink} onPress={onNavigateRegister}>
            <Text style={styles.registerLinkText}>{t('auth.registerPrompt')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 20 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  brandHeader: { alignItems: 'center', marginTop: 30, marginBottom: 24 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: colors.navy, fontFamily: 'serif' },
  brandSub: { fontSize: 13, color: colors.gray, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.dark, marginBottom: 12 },
  darkText: { color: colors.darkTheme.textPrimary },
  roleTabs: { flexDirection: 'row', marginBottom: 16 },
  roleTab: { flex: 1, backgroundColor: '#E2E8F0', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  activeTab: { backgroundColor: colors.navy },
  roleTabText: { fontSize: 13, fontWeight: '600', color: colors.dark },
  activeTabText: { color: '#FFF' },
  publicCtaCard: { backgroundColor: '#FEF3C7', borderColor: colors.gold, borderWidth: 1, padding: 14, borderRadius: 8, marginBottom: 20 },
  publicCtaTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E' },
  publicCtaSub: { fontSize: 12, color: '#B45309', marginTop: 2 },
  formCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: colors.navy, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, color: colors.dark },
  darkInput: { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' },
  noticeBox: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 6, marginBottom: 14 },
  noticeText: { fontSize: 11, color: colors.blue, fontWeight: '500' },
  submitBtn: { backgroundColor: colors.blue, paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerLinkText: { color: colors.blue, fontWeight: '600', fontSize: 13 }
});
