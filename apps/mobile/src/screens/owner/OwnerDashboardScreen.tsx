import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, getStatusPillColors } from '../../../../packages/ui-kit/src';
import { Instrument, Application } from '../../../../packages/shared-types/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';

interface OwnerDashboardScreenProps {
  ownerId: string;
  onApplyNew: () => void;
  onViewCert: (certId: string) => void;
  onLogout: () => void;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({
  ownerId,
  onApplyNew,
  onViewCert,
  onLogout
}) => {
  const { isDark } = useTheme();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [instRes, appRes] = await Promise.all([
        fetch(`http://localhost:4000/v1/instruments?ownerId=${ownerId}`),
        fetch(`http://localhost:4000/v1/applications?ownerId=${ownerId}`)
      ]);
      const instData = await instRes.json();
      const appData = await appRes.json();

      if (instData.instruments) setInstruments(instData.instruments);
      if (appData.applications) setApplications(appData.applications);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ownerId]);

  return (
    <ScrollView
      style={[styles.container, isDark && styles.darkContainer]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('owner.dashboardTitle')}</Text>
          <Text style={styles.headerSub}>Trader ID: {ownerId}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.applyCtaBtn} onPress={onApplyNew}>
        <Text style={styles.applyCtaText}>{t('owner.applyCta')}</Text>
      </TouchableOpacity>

      <View style={styles.alertBanner}>
        <Text style={styles.alertIcon}>⚠️</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.alertTitle}>Statutory Verification Reminder</Text>
          <Text style={styles.alertSub}>1 instrument is due for annual re-verification in 14 days under Legal Metrology Rules, 2011.</Text>
        </View>
      </View>

      <Text style={[styles.sectionHeading, isDark && styles.darkText]}>{t('owner.myInstruments')}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.navy} style={{ marginTop: 20 }} />
      ) : (
        instruments.map(inst => {
          const app = applications.find(a => a.instrumentId === inst.id);
          const status = app ? app.status : 'Submitted';
          const pill = getStatusPillColors(status, isDark);

          return (
            <View key={inst.id} style={[styles.card, isDark && styles.darkCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{inst.category}</Text>
                <View style={[styles.pill, { backgroundColor: pill.background }]}>
                  <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
                </View>
              </View>

              <Text style={[styles.instName, isDark && styles.darkText]}>{inst.manufacturer} — {inst.capacity}</Text>
              <Text style={styles.instMeta}>Serial No: {inst.serialNo} • Model: {inst.modelNo || 'N/A'}</Text>
              <Text style={styles.instMeta}>Location: {inst.installationAddress}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  Next Due: <Text style={{ fontWeight: 'bold', color: inst.nextDueDate && inst.nextDueDate < '2026-09-19' ? colors.red : colors.green }}>
                    {inst.nextDueDate || 'Pending Certification'}
                  </Text>
                </Text>

                {status === 'Certified' && (
                  <TouchableOpacity
                    style={styles.viewCertBtn}
                    onPress={() => onViewCert('cert-8001')}
                  >
                    <Text style={styles.viewCertText}>📜 {t('owner.certificate')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.navy, fontFamily: 'serif' },
  headerSub: { fontSize: 12, color: colors.gray },
  darkText: { color: colors.darkTheme.textPrimary },
  logoutBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: colors.red, fontWeight: 'bold', fontSize: 12 },
  applyCtaBtn: { backgroundColor: colors.blue, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16, elevation: 2 },
  applyCtaText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  alertBanner: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderColor: colors.gold, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },
  alertIcon: { fontSize: 24 },
  alertTitle: { fontSize: 13, fontWeight: 'bold', color: '#92400E' },
  alertSub: { fontSize: 11, color: '#B45309', marginTop: 2 },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: colors.dark, marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { fontSize: 11, fontWeight: 'bold', color: colors.navy, backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pillText: { fontSize: 11, fontWeight: 'bold' },
  instName: { fontSize: 15, fontWeight: 'bold', color: colors.dark, marginBottom: 4 },
  instMeta: { fontSize: 12, color: colors.gray, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dateText: { fontSize: 12, color: colors.gray },
  viewCertBtn: { backgroundColor: colors.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewCertText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});
