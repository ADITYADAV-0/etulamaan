import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inspection, SyncQueueItem, SyncStatus } from '@etulamaan/shared-types';
import { apiFetch } from './api';

const SYNC_QUEUE_KEY = '@etulamaan_offline_sync_queue';

export class SyncEngine {
  private queue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadQueueFromStorage();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private async loadQueueFromStorage() {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
        this.notify();
      }
    } catch (e) {
      console.error('Failed loading sync queue from storage', e);
    }
  }

  private async persistQueue() {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
      this.notify();
    } catch (e) {
      console.error('Failed persisting sync queue', e);
    }
  }

  public setOnlineStatus(status: boolean) {
    this.isOnline = status;
    this.notify();
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  /**
   * Save an inspection result to the offline queue.
   * Keyed by server-issued taskId per ADR-005.
   */
  public async queueInspection(inspection: Inspection): Promise<SyncQueueItem> {
    const existingIndex = this.queue.findIndex(item => item.taskId === inspection.id);

    const queueItem: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskId: inspection.id,
      inspectionData: inspection,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.queue[existingIndex] = queueItem;
    } else {
      this.queue.push(queueItem);
    }

    await this.persistQueue();

    if (this.isOnline) {
      this.triggerSync();
    }

    return queueItem;
  }

  public async triggerSync(): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing || !this.isOnline) {
      return { syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];

      if (item.status === 'synced') continue;

      item.status = 'syncing';
      item.lastAttemptAt = new Date().toISOString();
      await this.persistQueue();

      try {
        const response = await apiFetch('/inspections/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.inspectionData)
        });

        if (response.ok) {
          const result = await response.json();
          item.status = 'synced';
          syncedCount++;
        } else {
          item.status = 'failed';
          item.retryCount += 1;
          item.errorMessage = `HTTP error ${response.status}`;
          failedCount++;
        }
      } catch (err: any) {
        item.status = 'failed';
        item.retryCount += 1;
        item.errorMessage = err.message || 'Network sync error';
        failedCount++;
      }

      await this.persistQueue();
    }

    this.isSyncing = false;
    this.notify();
    return { syncedCount, failedCount };
  }

  public async clearSyncedItems() {
    this.queue = this.queue.filter(i => i.status !== 'synced');
    await this.persistQueue();
  }
}

export const syncEngine = new SyncEngine();
