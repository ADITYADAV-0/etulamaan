import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { User, UserRole, Inspection } from '@etulamaan/shared-types';
import { setLanguage, getCurrentLanguage } from '../i18n';
import { useTheme } from '../theme/ThemeContext';
import { secureStore } from '../services/secureStore';

// Screens
import { PublicScanScreen } from '../screens/public/PublicScanScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { TwoFactorScreen } from '../screens/auth/TwoFactorScreen';
import { RegisterOwnerScreen } from '../screens/auth/RegisterOwnerScreen';
import { EKycScreen } from '../screens/auth/EKycScreen';
import { OwnerDashboardScreen } from '../screens/owner/OwnerDashboardScreen';
import { ApplyMultiStepFormScreen } from '../screens/owner/ApplyMultiStepFormScreen';
import { CertificateViewScreen } from '../screens/owner/CertificateViewScreen';
import { LmoTaskQueueScreen } from '../screens/lmo/LmoTaskQueueScreen';
import { OfflineInspectionFormScreen } from '../screens/lmo/OfflineInspectionFormScreen';
import { SyncQueueStatusScreen } from '../screens/lmo/SyncQueueStatusScreen';
import { DeficiencyMemoScreen } from '../screens/lmo/DeficiencyMemoScreen';

export type ScreenState =
  | 'PUBLIC'
  | 'LOGIN'
  | 'TWO_FACTOR'
  | 'REGISTER'
  | 'EKYC'
  | 'OWNER_DASHBOARD'
  | 'OWNER_APPLY'
  | 'OWNER_CERTIFICATE'
  | 'LMO_QUEUE'
  | 'LMO_INSPECT'
  | 'LMO_SYNC_QUEUE'
  | 'LMO_DEFICIENCY';

export const AppNavigator: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('LOGIN');
  const [currentRole, setCurrentRole] = useState<UserRole>('Owner');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pending2FAUserId, setPending2FAUserId] = useState<string>('');
  const [activeCertId, setActiveCertId] = useState<string>('cert-8001');
  const [activeTask, setActiveTask] = useState<Inspection | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>(getCurrentLanguage());

  const handleToggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    setLang(nextLang);
  };

  const handleLoginSuccess = (user: User, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    if (role === 'Owner') {
      setCurrentScreen('OWNER_DASHBOARD');
    } else if (role === 'LMO') {
      setCurrentScreen('LMO_QUEUE');
    }
  };

  const handleLogout = async () => {
    await secureStore.removeItem('authToken');
    setCurrentUser(null);
    setPending2FAUserId('');
    setActiveTask(null);
    setCurrentScreen('LOGIN');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.globalHeader, isDark && styles.darkGlobalHeader]}>
        <TouchableOpacity style={styles.brandTitleBtn} onPress={() => setCurrentScreen('LOGIN')}>
          <Text style={styles.brandLogoText}>eTulaMaan ⚖️</Text>
        </TouchableOpacity>

        <View style={styles.controlGroup}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleToggleLanguage}>
            <Text style={styles.controlBtnText}>{lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleTheme}>
            <Text style={styles.controlBtnText}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {currentScreen === 'PUBLIC' && (
          <PublicScanScreen />
        )}

        {currentScreen === 'LOGIN' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigate2FA={(userId) => { setPending2FAUserId(userId); setCurrentScreen('TWO_FACTOR'); }}
            onNavigateRegister={() => setCurrentScreen('REGISTER')}
            onNavigatePublic={() => setCurrentScreen('PUBLIC')}
          />
        )}

        {currentScreen === 'TWO_FACTOR' && (
          <TwoFactorScreen
            userId={pending2FAUserId}
            onVerifySuccess={(user, role) => handleLoginSuccess(user, role)}
            onCancel={() => setCurrentScreen('LOGIN')}
          />
        )}

        {currentScreen === 'REGISTER' && (
          <RegisterOwnerScreen
            onSuccess={(user) => { setCurrentUser(user); setCurrentScreen('EKYC'); }}
            onCancel={() => setCurrentScreen('LOGIN')}
          />
        )}

        {currentScreen === 'EKYC' && (
          <EKycScreen
            user={currentUser}
            onComplete={(user) => { setCurrentUser(user); setCurrentScreen('OWNER_DASHBOARD'); }}
          />
        )}

        {currentScreen === 'OWNER_DASHBOARD' && (
          <OwnerDashboardScreen
            ownerId={currentUser?.id || 'usr-owner-1'}
            onApplyNew={() => setCurrentScreen('OWNER_APPLY')}
            onViewCert={(certId) => { setActiveCertId(certId); setCurrentScreen('OWNER_CERTIFICATE'); }}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'OWNER_APPLY' && (
          <ApplyMultiStepFormScreen
            ownerId={currentUser?.id || 'usr-owner-1'}
            onComplete={() => setCurrentScreen('OWNER_DASHBOARD')}
            onCancel={() => setCurrentScreen('OWNER_DASHBOARD')}
          />
        )}

        {currentScreen === 'OWNER_CERTIFICATE' && (
          <CertificateViewScreen
            certId={activeCertId}
            onBack={() => setCurrentScreen('OWNER_DASHBOARD')}
          />
        )}

        {currentScreen === 'LMO_QUEUE' && (
          <LmoTaskQueueScreen
            officerId={currentUser?.id || 'usr-lmo-1'}
            onOpenInspection={(task) => { setActiveTask(task); setCurrentScreen('LMO_INSPECT'); }}
            onOpenSyncQueue={() => setCurrentScreen('LMO_SYNC_QUEUE')}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'LMO_INSPECT' && activeTask && (
          <OfflineInspectionFormScreen
            task={activeTask}
            onComplete={() => setCurrentScreen('LMO_QUEUE')}
            onCancel={() => setCurrentScreen('LMO_QUEUE')}
          />
        )}

        {currentScreen === 'LMO_SYNC_QUEUE' && (
          <SyncQueueStatusScreen
            onBack={() => setCurrentScreen('LMO_QUEUE')}
          />
        )}

        {currentScreen === 'LMO_DEFICIENCY' && (
          <DeficiencyMemoScreen
            onBack={() => setCurrentScreen('LMO_QUEUE')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.lightBg },
  darkSafeArea: { backgroundColor: colors.darkTheme.bg },
  globalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 10 },
  darkGlobalHeader: { backgroundColor: '#0F172A' },
  brandTitleBtn: { paddingVertical: 4 },
  brandLogoText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  controlGroup: { flexDirection: 'row' },
  controlBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginLeft: 6 },
  controlBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 }
});
