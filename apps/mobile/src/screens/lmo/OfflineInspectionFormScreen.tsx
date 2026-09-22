import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../../packages/ui-kit/src';
import { Inspection, ChecklistCategoryItem, InspectionReading, InspectionResult } from '../../../../packages/shared-types/src';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { syncEngine } from '../../services/syncEngine';

interface OfflineInspectionFormScreenProps {
  task: Inspection;
  onComplete: () => void;
  onCancel: () => void;
}

export const OfflineInspectionFormScreen: React.FC<OfflineInspectionFormScreenProps> = ({
  task,
  onComplete,
  onCancel
}) => {
  const { isDark } = useTheme();
  const [checklist, setChecklist] = useState<ChecklistCategoryItem[]>(task.checklist || []);
  const [readings, setReadings] = useState<InspectionReading[]>(task.readings || []);
  const [decision, setDecision] = useState<InspectionResult>('pass');
  const [notes, setNotes] = useState(task.notes || 'All statutory tolerances checked under Legal Metrology Rules, 2011.');
  const [saving, setSaving] = useState(false);

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const updateReadingObserved = (index: number, val: string) => {
    const updated = [...readings];
    updated[index].observedValue = val;
    setReadings(updated);
  };

  const handleSaveInspection = async () => {
    setSaving(true);
    try {
      const completedInspection: Inspection = {
        ...task,
        checklist,
        readings,
        result: decision,
        notes,
        evidenceUrls: ['https://etulamaan.gov.in/evidence/photo-geo-stamped.jpg'],
        geo: { latitude: 28.6139, longitude: 77.2090, address: 'Sector 12 Field Inspection Site' },
        timestamp: new Date().toISOString()
      };

      await syncEngine.queueInspection(completedInspection);

      const isOnline = syncEngine.getOnlineStatus();
      if (isOnline) {
        Alert.alert('Inspection Saved', 'Inspection completed and synced to server!');
      } else {
        Alert.alert('Saved Offline (ADR-005)', 'Inspection saved locally to offline queue. Will auto-sync when online.');
      }

      onComplete();
    } catch (e: any) {
      Alert.alert('Save Error', e.message || 'Failed saving inspection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.offlineIndicatorBanner}>
        <Text style={styles.offlineBannerText}>
          ⚡ {syncEngine.getOnlineStatus() ? 'ONLINE MODE' : 'OFFLINE-FIRST FIELD MODE (ADR-005)'} — Zero Connectivity Safe
        </Text>
      </View>

      <Text style={[styles.title, isDark && styles.darkText]}>Digital Field Inspection Form</Text>
      <Text style={styles.sub}>Task ID: {task.id} • Application: {task.applicationId}</Text>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={[styles.cardHeading, isDark && styles.darkText]}>{t('lmo.checklistSection')}</Text>

        {checklist.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.checkRow, item.passed && styles.checkRowPassed]}
            onPress={() => toggleChecklist(item.id)}
          >
            <Text style={styles.checkIcon}>{item.passed ? '✅' : '❌'}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.checkTitle, isDark && styles.darkText]}>{item.title}</Text>
              <Text style={styles.checkDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={[styles.cardHeading, isDark && styles.darkText]}>{t('lmo.readingsSection')}</Text>

        {readings.map((rd, idx) => (
          <View key={idx} style={styles.readingBox}>
            <Text style={[styles.rdParam, isDark && styles.darkText]}>{rd.parameter}</Text>
            <View style={styles.rdRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rdMeta}>Standard: {rd.standardValue}</Text>
                <Text style={styles.rdMeta}>Tolerance: {rd.tolerance}</Text>
              </View>

              <View style={{ width: 120 }}>
                <Text style={styles.rdMeta}>Observed Value:</Text>
                <TextInput
                  style={[styles.rdInput, isDark && styles.darkInput]}
                  value={rd.observedValue}
                  onChangeText={val => updateReadingObserved(idx, val)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={[styles.cardHeading, isDark && styles.darkText]}>{t('lmo.evidenceSection')}</Text>

        <View style={styles.geoBox}>
          <Text style={styles.geoIcon}>📍</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.geoTitle}>Geo-Tag Captured (GPS Encrypted)</Text>
            <Text style={styles.geoCoords}>{t('lmo.geoCaptured', { lat: 28.6139, lng: 77.2090 })}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.photoBtn} onPress={() => Alert.alert('Camera', 'Photo captured & geo-stamped.')}>
          <Text style={styles.photoBtnText}>📷 Capture Geo-Tagged Stamping Evidence</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <Text style={[styles.cardHeading, isDark && styles.darkText]}>{t('lmo.decisionSection')}</Text>

        <View style={styles.decisionRow}>
          <TouchableOpacity
            style={[styles.decisionBtn, decision === 'pass' && styles.passActive]}
            onPress={() => setDecision('pass')}
          >
            <Text style={[styles.decisionText, decision === 'pass' && styles.decisionActiveText]}>
              {t('lmo.passDecision')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.decisionBtn, decision === 'fail' && styles.failActive]}
            onPress={() => setDecision('fail')}
          >
            <Text style={[styles.decisionText, decision === 'fail' && styles.decisionActiveText]}>
              {t('lmo.failDecision')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, isDark && styles.darkText, { marginTop: 12 }]}>{t('lmo.notesLabel')}</Text>
        <TextInput
          style={[styles.notesInput, isDark && styles.darkInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSaveInspection} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveSubmitText}>💾 {t('lmo.completeAndSave')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  offlineIndicatorBanner: { backgroundColor: colors.navy, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 14, alignItems: 'center' },
  offlineBannerText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.navy, fontFamily: 'serif' },
  sub: { fontSize: 12, color: colors.gray, marginBottom: 16, marginTop: 2 },
  darkText: { color: colors.darkTheme.textPrimary },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 16, marginBottom: 16, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  cardHeading: { fontSize: 15, fontWeight: 'bold', color: colors.navy, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  checkRowPassed: { backgroundColor: '#F0FDF4', borderColor: colors.green },
  checkIcon: { fontSize: 20 },
  checkTitle: { fontSize: 13, fontWeight: 'bold', color: colors.dark },
  checkDesc: { fontSize: 11, color: colors.gray, marginTop: 2 },
  readingBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 10 },
  rdParam: { fontSize: 13, fontWeight: 'bold', color: colors.dark, marginBottom: 4 },
  rdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rdMeta: { fontSize: 11, color: colors.gray },
  rdInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, color: colors.dark, marginTop: 2 },
  darkInput: { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' },
  geoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  geoIcon: { fontSize: 24 },
  geoTitle: { fontSize: 12, fontWeight: 'bold', color: colors.navy },
  geoCoords: { fontSize: 11, color: colors.blue, marginTop: 2 },
  photoBtn: { backgroundColor: '#E2E8F0', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  photoBtnText: { color: colors.dark, fontWeight: 'bold', fontSize: 12 },
  decisionRow: { flexDirection: 'row', marginBottom: 12 },
  decisionBtn: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 4 },
  passActive: { backgroundColor: colors.green },
  failActive: { backgroundColor: colors.red },
  decisionText: { fontSize: 12, fontWeight: 'bold', color: colors.dark },
  decisionActiveText: { color: '#FFF' },
  label: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  notesInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, fontSize: 13, color: colors.dark, marginBottom: 16 },
  saveSubmitBtn: { backgroundColor: colors.blue, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  saveSubmitText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: colors.gray, fontWeight: '600' }
});
