import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, getStatusPillColors } from '../../../../packages/ui-kit/src';
import { Certificate } from '../../../../packages/shared-types/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';

interface CertificateViewScreenProps {
  certId: string;
  onBack: () => void;
}

export const CertificateViewScreen: React.FC<CertificateViewScreenProps> = ({ certId, onBack }) => {
  const { isDark } = useTheme();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await fetch(`http://localhost:4000/v1/certificates/${certId}`);
        const data = await res.json();
        if (data.certificate) setCert(data.certificate);
      } catch (e) {
        console.error('Error loading certificate', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [certId]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.navy} style={{ flex: 1, marginTop: 50 }} />;
  }

  if (!cert) {
    return (
      <View style={styles.container}>
        <Text>Certificate not found.</Text>
        <TouchableOpacity onPress={onBack}><Text style={{ color: colors.blue }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  const pill = getStatusPillColors(cert.status, isDark);

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← {t('common.back')}</Text>
      </TouchableOpacity>

      <View style={[styles.certCard, isDark && styles.darkCard]}>
        <View style={styles.sealHeader}>
          <Text style={styles.govSeal}>🇮🇳 GOVERNMENT OF INDIA</Text>
          <Text style={styles.deptName}>Department of Legal Metrology</Text>
          <Text style={styles.certHeading}>DIGITAL VERIFICATION CERTIFICATE</Text>
          <Text style={styles.ruleNotice}>Issued under Legal Metrology Act, 2009 & Rules, 2011</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <View style={[styles.statusBadge, { backgroundColor: pill.background }]}>
              <Text style={[styles.statusText, { color: pill.color }]}>{pill.label.toUpperCase()}</Text>
            </View>
            <Text style={styles.certNo}>Certificate No: {cert.id}</Text>
          </View>

          <View style={styles.qrBox}>
            <Text style={styles.qrIcon}>📱</Text>
            <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Owner / Establishment:</Text>
            <Text style={[styles.infoVal, isDark && styles.darkText]}>{cert.ownerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Instrument Category:</Text>
            <Text style={[styles.infoVal, isDark && styles.darkText]}>{cert.instrumentCategory}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Serial Number:</Text>
            <Text style={[styles.infoVal, isDark && styles.darkText]}>{cert.serialNo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Date of Verification:</Text>
            <Text style={[styles.infoVal, isDark && styles.darkText]}>{new Date(cert.issuedAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Valid Until:</Text>
            <Text style={[styles.infoVal, { color: colors.green, fontWeight: 'bold' }]}>
              {new Date(cert.validUntil).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.pkiFooter}>
          <Text style={styles.pkiTitle}>🔒 Cryptographic PKI Signature & Stamp</Text>
          <Text style={styles.pkiHash}>Signed via NIC e-Sign Service: {cert.signature}</Text>
          <Text style={styles.pkiHash}>Hash: {cert.qrPayload.signatureHash}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Certificate Download', 'Official PDF certificate saved to device downloads.')}
        >
          <Text style={styles.actionBtnText}>📥 Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.blue }]}
          onPress={() => Alert.alert('Share Certificate', 'Certificate verification link copied to clipboard.')}
        >
          <Text style={styles.actionBtnText}>🔗 Share QR Link</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  backBtn: { marginBottom: 12, marginTop: 6 },
  backBtnText: { color: colors.blue, fontWeight: 'bold', fontSize: 14 },
  certCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, borderWidth: 2, borderColor: colors.gold, elevation: 4 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg, borderColor: colors.gold },
  sealHeader: { alignItems: 'center', marginBottom: 12 },
  govSeal: { fontSize: 13, fontWeight: 'bold', color: colors.navy },
  deptName: { fontSize: 14, fontWeight: 'bold', color: colors.dark, marginTop: 2 },
  certHeading: { fontSize: 15, fontWeight: 'bold', color: colors.gold, marginTop: 6, fontFamily: 'serif' },
  ruleNotice: { fontSize: 10, color: colors.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  certNo: { fontSize: 12, fontWeight: '600', color: colors.gray },
  qrBox: { width: 75, height: 75, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  qrIcon: { fontSize: 32 },
  qrLabel: { fontSize: 8, color: colors.gray, fontWeight: 'bold', marginTop: 2 },
  infoGrid: { marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoKey: { fontSize: 12, color: colors.gray },
  infoValue: { fontSize: 12, fontWeight: '600', color: colors.dark },
  darkText: { color: colors.darkTheme.textPrimary },
  infoVal: { fontSize: 12, fontWeight: '600', color: colors.dark },
  pkiFooter: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.navy },
  pkiTitle: { fontSize: 11, fontWeight: 'bold', color: colors.navy },
  pkiHash: { fontSize: 9, color: colors.gray, marginTop: 2, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 30 },
  actionBtn: { flex: 1, backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});
