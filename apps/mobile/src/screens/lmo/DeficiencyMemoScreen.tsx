import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';

interface DeficiencyMemoScreenProps {
  onBack: () => void;
}

export const DeficiencyMemoScreen: React.FC<DeficiencyMemoScreenProps> = ({ onBack }) => {
  const { isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← {t('common.back')}</Text>
      </TouchableOpacity>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <View style={styles.header}>
          <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
          <Text style={styles.memoTitle}>{t('lmo.deficiencyMemoTitle')}</Text>
          <Text style={styles.subRule}>Legal Metrology Act, 2009 Section 24 Notice</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.meta}>Memo Ref: MEMO-2026-9912</Text>
        <Text style={styles.meta}>Issued Date: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionHead}>Deficiencies Identified During Inspection:</Text>
        <View style={styles.defBox}>
          <Text style={styles.defItem}>• Zero load error (+0.015kg) exceeds statutory tolerance (±0.005kg).</Text>
          <Text style={styles.defItem}>• Verification seal broken/tampered on lead housing.</Text>
        </View>

        <Text style={styles.sectionHead}>Mandatory Action Required:</Text>
        <Text style={styles.actionText}>
          The trader/owner must recalibrate and repair the instrument through an authorized manufacturer/repairer within 14 days and submit a re-verification application on eTulaMaan.
        </Text>

        <TouchableOpacity style={styles.issueBtn} onPress={() => Alert.alert('Memo Signed', 'Deficiency memo signed & sent to owner via SMS/Email.')}>
          <Text style={styles.issueBtnText}>📩 Issue Deficiency Memo to Trader</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  backBtn: { marginBottom: 10, marginTop: 6 },
  backBtnText: { color: colors.blue, fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, borderWidth: 2, borderColor: colors.red, elevation: 3 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg, borderColor: colors.red },
  header: { alignItems: 'center', marginBottom: 12 },
  govTitle: { fontSize: 12, fontWeight: 'bold', color: colors.navy },
  memoTitle: { fontSize: 18, fontWeight: 'bold', color: colors.red, marginTop: 4, fontFamily: 'serif' },
  subRule: { fontSize: 11, color: colors.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 10 },
  meta: { fontSize: 12, color: colors.gray, marginBottom: 4 },
  sectionHead: { fontSize: 14, fontWeight: 'bold', color: colors.dark, marginTop: 12, marginBottom: 6 },
  defBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 6, marginBottom: 12 },
  defItem: { fontSize: 12, color: colors.red, fontWeight: '600', marginBottom: 4 },
  actionText: { fontSize: 12, color: colors.dark, lineHeight: 18 },
  issueBtn: { backgroundColor: colors.red, paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  issueBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
