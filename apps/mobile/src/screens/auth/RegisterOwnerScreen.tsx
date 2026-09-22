import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../../packages/ui-kit/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';

interface RegisterOwnerScreenProps {
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

export const RegisterOwnerScreen: React.FC<RegisterOwnerScreenProps> = ({ onSuccess, onCancel }) => {
  const { isDark } = useTheme();
  const [name, setName] = useState('Rajesh Kumar (Trader)');
  const [email, setEmail] = useState('rajesh.traders@example.com');
  const [phone, setPhone] = useState('+919876543210');
  const [jurisdiction, setJurisdiction] = useState('District 1 - Central Zone');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/v1/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, jurisdiction })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user);
      } else {
        Alert.alert('Registration Failed', data.error?.message || 'Error creating owner account');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not reach server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>Owner Self-Registration</Text>
      <Text style={styles.sub}>Register your business to apply for statutory verification certificates.</Text>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={[styles.label, isDark && styles.darkText]}>Business Owner / Trader Name</Text>
        <TextInput style={[styles.input, isDark && styles.darkInput]} value={name} onChangeText={setName} />

        <Text style={[styles.label, isDark && styles.darkText]}>Official Email Address</Text>
        <TextInput style={[styles.input, isDark && styles.darkInput]} value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={[styles.label, isDark && styles.darkText]}>Mobile Phone Number</Text>
        <TextInput style={[styles.input, isDark && styles.darkInput]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={[styles.label, isDark && styles.darkText]}>State / Jurisdiction</Text>
        <TextInput style={[styles.input, isDark && styles.darkInput]} value={jurisdiction} onChangeText={setJurisdiction} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Register & Proceed to e-KYC</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 20 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.navy, marginTop: 20 },
  sub: { fontSize: 13, color: colors.gray, marginBottom: 20, marginTop: 4 },
  darkText: { color: colors.darkTheme.textPrimary },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  label: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, color: colors.dark },
  darkInput: { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' },
  submitBtn: { backgroundColor: colors.navy, paddingVertical: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  cancelBtnText: { color: colors.gray, fontWeight: '600' }
});
