import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../../packages/ui-kit/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';

interface EKycScreenProps {
  user: any;
  onComplete: (user: any) => void;
}

export const EKycScreen: React.FC<EKycScreenProps> = ({ user, onComplete }) => {
  const { isDark } = useTheme();
  const [aadhaarNo, setAadhaarNo] = useState('998877665544');
  const [loading, setLoading] = useState(false);

  const handleVerifyKyc = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/v1/auth/e-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, aadhaarNo })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('e-KYC Verified', 'DigiLocker / Aadhaar identity verified successfully!');
        onComplete(data.user);
      } else {
        Alert.alert('e-KYC Failed', data.error?.message || 'Verification error');
      }
    } catch (err) {
      Alert.alert('Error', 'KYC service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={styles.badge}>🇮🇳 Government Aadhaar Gateway</Text>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('auth.eKycHeader')}</Text>
        <Text style={styles.sub}>Instant identity validation via DigiLocker / UIDAI API stub.</Text>

        <Text style={[styles.label, isDark && styles.darkText]}>{t('auth.aadhaarLabel')}</Text>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          value={aadhaarNo}
          onChangeText={setAadhaarNo}
          keyboardType="number-pad"
          maxLength={12}
        />

        <TouchableOpacity style={styles.btn} onPress={handleVerifyKyc} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{t('auth.eKycBtn')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, justifyContent: 'center', padding: 20 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, elevation: 3 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  badge: { fontSize: 12, color: colors.blue, fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 12, color: colors.gray, marginBottom: 20 },
  darkText: { color: colors.darkTheme.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, color: colors.dark },
  darkInput: { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' },
  btn: { backgroundColor: colors.green, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});
