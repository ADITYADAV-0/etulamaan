import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { InstrumentCategory } from '@etulamaan/shared-types';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { apiFetch } from '../../services/api';

interface ApplyMultiStepFormScreenProps {
  ownerId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const ApplyMultiStepFormScreen: React.FC<ApplyMultiStepFormScreenProps> = ({
  ownerId,
  onComplete,
  onCancel
}) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<InstrumentCategory>('Non-Automatic Weighing Instrument');
  const [capacity, setCapacity] = useState('100 kg (Class III)');
  const [manufacturer, setManufacturer] = useState('Avery India');
  const [serialNo, setSerialNo] = useState(`SR-${Math.floor(Math.random() * 89999 + 10000)}`);
  const [address, setAddress] = useState('Shop 42, Central Commercial Complex');
  const [feeAmount, setFeeAmount] = useState(650);
  const [loading, setLoading] = useState(false);

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      const instRes = await apiFetch('/instruments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, category, capacity, manufacturer, serialNo, installationAddress: address })
      });
      const instData = await instRes.json();

      const appRes = await apiFetch('/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: instData.instrument.id,
          ownerId,
          type: 'new',
          feeAmount,
          documentUrls: ['https://etulamaan.gov.in/docs/sample-invoice.pdf'],
          photoUrls: ['https://etulamaan.gov.in/photos/sample-scale.jpg']
        })
      });

      if (appRes.ok) {
        Alert.alert('Success', t('owner.paymentSuccess'));
        onComplete();
      } else {
        Alert.alert('Error', 'Failed submitting application');
      }
    } catch (err) {
      Alert.alert('Error', 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('owner.applyHeader')}</Text>

      <View style={styles.stepperContainer}>
        <View style={[styles.stepItem, step >= 1 && styles.activeStepItem]}>
          <Text style={styles.stepNum}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepItem, step >= 2 && styles.activeStepItem]}>
          <Text style={styles.stepNum}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepItem, step >= 3 && styles.activeStepItem]}>
          <Text style={styles.stepNum}>3</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepItem, step >= 4 && styles.activeStepItem]}>
          <Text style={styles.stepNum}>4</Text>
        </View>
      </View>

      {step === 1 && (
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.stepTitle, isDark && styles.darkText]}>{t('owner.step1')}</Text>

          <Text style={[styles.label, isDark && styles.darkText]}>Instrument Category</Text>
          <TextInput style={[styles.input, isDark && styles.darkInput]} value={category} onChangeText={(val) => setCategory(val as InstrumentCategory)} />

          <Text style={[styles.label, isDark && styles.darkText]}>Capacity & Class</Text>
          <TextInput style={[styles.input, isDark && styles.darkInput]} value={capacity} onChangeText={setCapacity} />

          <Text style={[styles.label, isDark && styles.darkText]}>Manufacturer Name</Text>
          <TextInput style={[styles.input, isDark && styles.darkInput]} value={manufacturer} onChangeText={setManufacturer} />

          <Text style={[styles.label, isDark && styles.darkText]}>Serial Number</Text>
          <TextInput style={[styles.input, isDark && styles.darkInput]} value={serialNo} onChangeText={setSerialNo} />

          <Text style={[styles.label, isDark && styles.darkText]}>Installation Address</Text>
          <TextInput style={[styles.input, isDark && styles.darkInput]} value={address} onChangeText={setAddress} />

          <TouchableOpacity style={styles.btnNext} onPress={() => setStep(2)}>
            <Text style={styles.btnNextText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.stepTitle, isDark && styles.darkText]}>{t('owner.step2')}</Text>

          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadTitle}>Purchase Invoice / Previous Certificate</Text>
            <Text style={styles.uploadStatus}>Attached: invoice-2024.pdf (420 KB)</Text>
          </View>

          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadTitle}>Instrument Stamping Photo</Text>
            <Text style={styles.uploadStatus}>Attached: scale-front.jpg (1.2 MB)</Text>
          </View>

          <View style={styles.rowBtn}>
            <TouchableOpacity style={styles.btnBack} onPress={() => setStep(1)}>
              <Text style={styles.btnBackText}>{t('common.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnNext} onPress={() => setStep(3)}>
              <Text style={styles.btnNextText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.stepTitle, isDark && styles.darkText]}>{t('owner.step3')}</Text>

          <View style={styles.feeBreakdownCard}>
            <Text style={styles.feeHeader}>Statutory Verification Fee (Rules, 2011)</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeKey}>Verification Fee:</Text>
              <Text style={styles.feeVal}>₹ 500.00</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeKey}>User Processing Charge:</Text>
              <Text style={styles.feeVal}>₹ 150.00</Text>
            </View>
            <View style={[styles.feeRow, { borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.feeKey, { fontWeight: 'bold' }]}>Total Payable Amount:</Text>
              <Text style={[styles.feeVal, { fontWeight: 'bold', color: colors.green, fontSize: 16 }]}>₹ {feeAmount}.00</Text>
            </View>
          </View>

          <Text style={[styles.label, isDark && styles.darkText]}>Payment Method</Text>
          <View style={styles.payOptionActive}>
            <Text style={styles.payOptionText}>💳 Bharatkosh / Treasury Gateway (UPI, Cards, NetBanking)</Text>
          </View>

          <View style={styles.rowBtn}>
            <TouchableOpacity style={styles.btnBack} onPress={() => setStep(2)}>
              <Text style={styles.btnBackText}>{t('common.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnNext} onPress={() => setStep(4)}>
              <Text style={styles.btnNextText}>{t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.stepTitle, isDark && styles.darkText]}>{t('owner.step4')}</Text>

          <View style={styles.reviewBox}>
            <Text style={styles.reviewHeading}>{category}</Text>
            <Text style={styles.reviewItem}>Manufacturer: {manufacturer}</Text>
            <Text style={styles.reviewItem}>Serial No: {serialNo}</Text>
            <Text style={styles.reviewItem}>Fee Paid: ₹{feeAmount}.00</Text>
            <Text style={styles.reviewItem}>Location: {address}</Text>
          </View>

          <TouchableOpacity style={styles.btnSubmitFinal} onPress={handleSubmitApplication} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSubmitFinalText}>{t('owner.payNow')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelForm} onPress={onCancel}>
            <Text style={styles.btnCancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.navy, marginBottom: 16, marginTop: 10, fontFamily: 'serif' },
  darkText: { color: colors.darkTheme.textPrimary },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepItem: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  activeStepItem: { backgroundColor: colors.blue },
  stepNum: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  stepLine: { width: 30, height: 2, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: colors.navy, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, color: colors.dark },
  darkInput: { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' },
  btnNext: { backgroundColor: colors.blue, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center' },
  btnNextText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  uploadBox: { backgroundColor: '#F1F5F9', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.blue, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 14 },
  uploadIcon: { fontSize: 28, marginBottom: 4 },
  uploadTitle: { fontSize: 13, fontWeight: 'bold', color: colors.dark },
  uploadStatus: { fontSize: 11, color: colors.green, marginTop: 2, fontWeight: '500' },
  rowBtn: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnBack: { backgroundColor: '#E2E8F0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 6 },
  btnBackText: { color: colors.dark, fontWeight: 'bold' },
  feeBreakdownCard: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 14, marginBottom: 16 },
  feeHeader: { fontSize: 13, fontWeight: 'bold', color: colors.navy, marginBottom: 10 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  feeKey: { fontSize: 12, color: colors.gray },
  feeVal: { fontSize: 12, color: colors.dark, fontWeight: '600' },
  payOptionActive: { backgroundColor: '#EFF6FF', borderColor: colors.blue, borderWidth: 1, padding: 12, borderRadius: 6, marginBottom: 16 },
  payOptionText: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  reviewBox: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, marginBottom: 16 },
  reviewHeading: { fontSize: 15, fontWeight: 'bold', color: colors.navy, marginBottom: 6 },
  reviewItem: { fontSize: 12, color: colors.dark, marginBottom: 4 },
  btnSubmitFinal: { backgroundColor: colors.green, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  btnSubmitFinalText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnCancelForm: { marginTop: 12, alignItems: 'center' },
  btnCancelText: { color: colors.gray, fontWeight: '600' }
});
