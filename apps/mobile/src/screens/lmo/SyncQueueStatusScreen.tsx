import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors } from '@etulamaan/ui-kit';
import { SyncQueueItem } from '@etulamaan/shared-types';
import { t } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { syncEngine } from '../../services/syncEngine';

interface SyncQueueStatusScreenProps {
  onBack: () => void;
}

export const SyncQueueStatusScreen: React.FC<SyncQueueStatusScreenProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [queue, setQueue] = useState<SyncQueueItem[]>(syncEngine.getQueue());
  const [isOnline, setIsOnline] = useState(syncEngine.getOnlineStatus());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe(() => {
      setQueue(syncEngine.getQueue());
      setIsOnline(syncEngine.getOnlineStatus());
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    const { syncedCount, failedCount } = await syncEngine.triggerSync();
    setSyncing(false);
    Alert.alert('Sync Process Completed', `Synced: ${syncedCount}, Failed: ${failedCount}`);
  };

  const handleClearSynced = async () => {
    await syncEngine.clearSyncedItems();
  };

  const getStatusColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'synced': return colors.green;
      case 'syncing': return colors.blue;
      case 'pending': return colors.gold;
      case 'failed': return colors.red;
      default: return colors.gray;
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← {t('common.back')}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, isDark && styles.darkText]}>{t('lmo.syncStatusTitle')}</Text>
      <Text style={styles.sub}>ADR-005 Keyed Upsert Sync Queue • Server Task ID Contract</Text>

      <View style={styles.syncBar}>
        <TouchableOpacity
          style={[styles.syncBtn, !isOnline && styles.disabledBtn]}
          onPress={handleManualSync}
          disabled={!isOnline || syncing}
        >
          {syncing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.syncBtnText}>🔄 Trigger Manual Sync Now</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClearSynced}>
          <Text style={styles.clearBtnText}>🧹 Clear Synced</Text>
        </TouchableOpacity>
      </View>

      {queue.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No pending items in offline sync queue.</Text>
        </View>
      ) : (
        queue.map(item => (
          <View key={item.id} style={[styles.itemCard, isDark && styles.darkCard]}>
            <View style={styles.itemHeader}>
              <Text style={styles.taskIdText}>Task ID: {item.taskId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={[styles.itemTitle, isDark && styles.darkText]}>
              Result: <Text style={{ fontWeight: 'bold', color: item.inspectionData.result === 'pass' ? colors.green : colors.red }}>
                {item.inspectionData.result.toUpperCase()}
              </Text>
            </Text>

            <Text style={styles.metaText}>Created At: {new Date(item.createdAt).toLocaleTimeString()}</Text>

            {item.errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Error: {item.errorMessage}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBg, padding: 16 },
  darkContainer: { backgroundColor: colors.darkTheme.bg },
  backBtn: { marginBottom: 10, marginTop: 6 },
  backBtnText: { color: colors.blue, fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.navy, fontFamily: 'serif' },
  sub: { fontSize: 12, color: colors.gray, marginBottom: 16, marginTop: 2 },
  darkText: { color: colors.darkTheme.textPrimary },
  syncBar: { flexDirection: 'row', marginBottom: 16 },
  syncBtn: { flex: 2, backgroundColor: colors.blue, paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  disabledBtn: { backgroundColor: '#CBD5E1' },
  syncBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  clearBtn: { flex: 1, backgroundColor: '#E2E8F0', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  clearBtnText: { color: colors.dark, fontWeight: 'bold', fontSize: 13 },
  emptyCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 8, alignItems: 'center' },
  emptyText: { color: colors.gray, fontSize: 13 },
  itemCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, marginBottom: 12, elevation: 2 },
  darkCard: { backgroundColor: colors.darkTheme.cardBg },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskIdText: { fontSize: 13, fontWeight: 'bold', color: colors.navy },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  itemTitle: { fontSize: 13, color: colors.dark, marginBottom: 2 },
  metaText: { fontSize: 11, color: colors.gray },
  errorBox: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 4, marginTop: 8 },
  errorText: { color: colors.red, fontSize: 11, fontWeight: '600' }
});
