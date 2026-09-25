import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors, getStatusPillColors } from '@etulamaan/ui-kit';
import { PublicVerificationResponse } from '@etulamaan/shared-types';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { apiFetch } from '../../services/api';

export const PublicScanScreen: React.FC = () => {
  const { isDark } = useTheme();
  const [certIdInput, setCertIdInput] = useState('cert-8001');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<PublicVerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (idToVerify?: string) => {
    const targetId = idToVerify || certIdInput.trim();
    if (!targetId) return;

    setLoading(true);
    setErrorMsg('');
    setVerification(null);

    try {
      const res = await apiFetch(`/public/certificates/${encodeURIComponent(targetId)}/verify`);
      const data = await res.json();
      if (res.ok && data.verification) {
        setVerification(data.verification);
      } else {
        setErrorMsg('Certificate not found or invalid format.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to public verification API.');
    } finally {
      setLoading(false);
    }
  };

  const pillStyle = verification ? getStatusPillColors(verification.status, isDark) : null;

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('public.scanTitle')}</Text>
        <Text style={styles.headerSub}>{t('appTagline')}</Text>
      </View>

      <View style={[styles.cameraBox, isDark && styles.darkCameraBox]}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraText}>{t('public.scanPrompt')}</Text>
        <TouchableOpacity
          style={styles.simScanBtn}
          onPress={() => handleVerify('cert-8001')}
        >
          <Text style={styles.simScanBtnText}>Simulate Camera QR Scan (cert-8001)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <Text style={[styles.label, isDark && styles.darkText]}>{t('public.manualEntry')}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, isDark && styles.darkInput]}
            value={certIdInput}
            onChangeText={setCertIdInput}
            placeholder="e.g. cert-8001"
            placeholderTextColor={isDark ? '#94A3B8' : '#5B6B73'}
          />
          <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify()}>
            <Text style={styles.verifyBtnText}>{t('public.verifyBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.navy} style={{ marginTop: 20 }} />}

      {errorMsg ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {verification && (
        <View style={[styles.resultCard, isDark && styles.darkCard]}>
          <View style={[styles.badgeBanner, { backgroundColor: pillStyle?.background }]}>
            <Text style={[styles.badgeText, { color: pillStyle?.color }]}>
              {pillStyle?.label.toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.certTitle, isDark && styles.darkText]}>{t('public.certDetails')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Certificate ID:</Text>
            <Text style={[styles.detailValue, isDark && styles.darkText]}>{verification.certificateId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Instrument Category:</Text>
            <Text style={[styles.detailValue, isDark && styles.darkText]}>{verification.instrumentCategory}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Serial No (Masked):</Text>
            <Text style={[styles.detailValue, isDark && styles.darkText]}>{verification.serialNoMasked}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Jurisdiction:</Text>
            <Text style={[styles.detailValue, isDark && styles.darkText]}>{verification.jurisdiction}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Issued Date:</Text>
            <Text style={[styles.detailValue, isDark && styles.darkText]}>{new Date(verification.issuedAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Valid Until:</Text>
            <Text style={[styles.detailValue, { color: verification.isValid ? colors.green : colors.red, fontWeight: 'bold' }]}>
              {new Date(verification.validUntil).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>🔒 {t('public.noPiiNotice')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  header: { marginBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.navy, fontFamily: 'serif' },
  headerSub: { fontSize: 12, color: colors.gray, marginTop: 4 },
  cameraBox: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.blue,
    borderStyle: 'dashed'
  },
  darkCameraBox: { backgroundColor: colors.darkTheme.cardBg, borderColor: colors.blue },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  cameraText: { fontSize: 14, color: colors.dark, fontWeight: '600', marginBottom: 12 },
  simScanBtn: { backgroundColor: colors.blue, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  simScanBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.dark, marginBottom: 8 },
  darkText: { color: colors.darkTheme.textPrimary },
  row: { flexDirection: 'row' },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.dark
  },
  darkInput: { backgroundColor: '#1E293B', borderColor: '#334155', color: '#FFF' },
  verifyBtn: { backgroundColor: colors.navy, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 6, marginLeft: 8 },
  verifyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  errorCard: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 6, marginBottom: 16 },
  errorText: { color: colors.red, fontSize: 13, fontWeight: '600' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  badgeBanner: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', marginBottom: 16 },
  badgeText: { fontWeight: 'bold', fontSize: 14 },
  certTitle: { fontSize: 16, fontWeight: 'bold', color: colors.navy, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailKey: { fontSize: 13, color: colors.gray },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.dark },
  privacyBox: { marginTop: 16, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 6, borderLeftWidth: 4, borderLeftColor: colors.green },
  privacyText: { fontSize: 11, color: colors.green, fontWeight: '600' }
});
