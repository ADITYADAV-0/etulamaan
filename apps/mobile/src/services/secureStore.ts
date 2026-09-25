import * as ExpoSecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SecureStore wrapper service.
 * Uses the platform secure keychain on native builds, with a web/test fallback.
 */
class SecureStoreService {
  private memoryStore: Map<string, string> = new Map();

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.memoryStore.set(key, value);
      await ExpoSecureStore.setItemAsync(key, value);
    } catch (err) {
      await AsyncStorage.setItem(`_sec_${key}`, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.memoryStore.has(key)) {
        return this.memoryStore.get(key) || null;
      }
      const value = await ExpoSecureStore.getItemAsync(key);
      if (value) {
        this.memoryStore.set(key, value);
        return value;
      }
      return null;
    } catch (err) {
      return AsyncStorage.getItem(`_sec_${key}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    this.memoryStore.delete(key);
    try {
      await ExpoSecureStore.deleteItemAsync(key);
    } catch (err) {
      await AsyncStorage.removeItem(`_sec_${key}`);
    }
  }
}

export const secureStore = new SecureStoreService();
