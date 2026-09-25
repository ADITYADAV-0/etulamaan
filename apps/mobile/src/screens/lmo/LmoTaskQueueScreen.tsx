import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch, RefreshControl } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { Inspection } from '@etulamaan/shared-types';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { syncEngine } from '../../services/syncEngine';
import { apiFetch } from '../../services/api';

interface LmoTaskQueueScreenProps {
  officerId: string;
  onOpenInspection: (task: Inspection) => void;
  onOpenSyncQueue: () => void;
  onLogout: () => void;
}

export const LmoTaskQueueScreen: React.FC<LmoTaskQueueScreenProps> = ({
  officerId,
  onOpenInspection,
  onOpenSyncQueue,
  onLogout
}) => {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(syncEngine.getOnlineStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const updateQueueCount = () => {
    const queue = syncEngine.getQueue();
    const pending = queue.filter(q => q.status !== 'synced').length;
    setPendingSyncCount(pending);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const res = await apiFetch(`/inspections/tasks?officerId=${encodeURIComponent(officerId)}`);
        const data = await res.json();
        if (data.tasks) setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Fetch tasks error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    updateQueueCount();
    const unsubscribe = syncEngine.subscribe(() => {
      updateQueueCount();
      setIsOnline(syncEngine.getOnlineStatus());
    });
    return unsubscribe;
  }, [officerId, isOnline]);

  const toggleNetworkMode = (val: boolean) => {
    setIsOnline(val);
    syncEngine.setOnlineStatus(val);
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.darkContainer]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTasks} />}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('lmo.taskQueueTitle')}</Text>
          <Text style={styles.headerSub}>Official: {officerId} (District 1)</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.networkBanner, !isOnline && styles.offlineBanner]}>
        <View style={styles.netInfo}>
          <Text style={styles.netIcon}>{isOnline ? '🌐' : '✈️'}</Text>
          <View>
            <Text style={styles.netTitle}>
              {isOnline ? t('common.onlineMode') : t('common.offlineMode')}
            </Text>
            <Text style={styles.netSub}>
              {isOnline ? 'Connected to Legal Metrology Cloud' : 'Field Inspection mode — Local sync queue active'}
            </Text>
          </View>
        </View>

        <Switch
          value={isOnline}
          onValueChange={toggleNetworkMode}
          trackColor={{ false: colors.red, true: colors.green }}
        />
      </View>

      <TouchableOpacity style={styles.syncQueueWidget} onPress={onOpenSyncQueue}>
        <View style={{ flex: 1 }}>
          <Text style={styles.syncWidgetTitle}>{t('lmo.syncStatusTitle')}</Text>
          <Text style={styles.syncWidgetSub}>
            {t('lmo.pendingSyncItems', { count: pendingSyncCount })}
          </Text>
        </View>
        <View style={styles.syncBadge}>
          <Text style={styles.syncBadgeText}>{pendingSyncCount} PENDING</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionHeading, isDark && styles.darkText]}>{t('lmo.assignedTasks')}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.navy} style={{ marginTop: 20 }} />
      ) : (
        tasks.map(task => (
          <View key={task.id} style={[styles.taskCard, isDark && styles.darkCard]}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskId}>Task ID: {task.id}</Text>
              <Text style={styles.appRef}>App Ref: {task.applicationId}</Text>
            </View>

            <Text style={[styles.taskTitle, isDark && styles.darkText]}>Non-Automatic Scale Verification</Text>
            <Text style={styles.taskMeta}>📍 {task.geo.address || 'Sector 12, Market Area'}</Text>
            <Text style={styles.taskMeta}>📋 Scheduled: {new Date(task.timestamp).toLocaleDateString()}</Text>

            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => onOpenInspection(task)}
            >
              <Text style={styles.startBtnText}>📋 {t('lmo.startInspection')}</Text>
            </TouchableOpacity>
          </View>
        ))
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
  networkBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E6F4EA', padding: 12, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: colors.green },
  offlineBanner: { backgroundColor: '#FEE2E2', borderColor: colors.red },
  netInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  netIcon: { fontSize: 24, marginRight: 10 },
  netTitle: { fontSize: 13, fontWeight: 'bold', color: colors.dark },
  netSub: { fontSize: 11, color: colors.gray, marginTop: 1 },
  syncQueueWidget: { flexDirection: 'row', backgroundColor: '#FEF8E7', borderColor: colors.gold, borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  syncWidgetTitle: { fontSize: 13, fontWeight: 'bold', color: '#92400E' },
  syncWidgetSub: { fontSize: 11, color: '#B45309', marginTop: 2 },
  syncBadge: { backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  syncBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: colors.dark, marginBottom: 12 },
  taskCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  taskId: { fontSize: 12, fontWeight: 'bold', color: colors.navy },
  appRef: { fontSize: 11, color: colors.gray },
  taskTitle: { fontSize: 15, fontWeight: 'bold', color: colors.dark, marginBottom: 4 },
  taskMeta: { fontSize: 12, color: colors.gray, marginBottom: 2 },
  startBtn: { backgroundColor: colors.green, paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
