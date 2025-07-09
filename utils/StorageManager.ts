import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandler } from './ErrorHandler';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

interface StorageConfig {
  maxAge?: number; // Time in milliseconds
  maxSize?: number; // Size in MB
  encryption?: boolean;
}

export class StorageManager {
  private static instance: StorageManager;
  private config: StorageConfig;

  private constructor() {
    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours default
      maxSize: 50, // 50MB default
      encryption: false, // Encryption not implemented yet
    };
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  setConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Generic storage methods with enhanced error handling
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      // Validate input
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }

      if (value === undefined || value === null) {
        throw new Error('Cannot store undefined or null values');
      }

      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: this.config.maxAge ? Date.now() + this.config.maxAge : undefined,
      };

      const serializedValue = JSON.stringify(item);
      
      // Check size before storing
      const sizeInMB = new Blob([serializedValue]).size / (1024 * 1024);
      if (sizeInMB > (this.config.maxSize || 50)) {
        throw new Error(`Data too large: ${sizeInMB.toFixed(2)}MB exceeds limit of ${this.config.maxSize}MB`);
      }

      await AsyncStorage.setItem(key, serializedValue);
      
      console.log(`Storage: Successfully stored ${key} (${sizeInMB.toFixed(2)}MB)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, `setItem(${key})`);
      throw new Error(`Failed to store ${key}: ${errorMessage}`);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      // Validate input
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }

      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.removeItem(key);
        console.log(`Storage: ${key} expired and was removed`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, `getItem(${key})`);
      
      // Try to remove corrupted data
      try {
        await AsyncStorage.removeItem(key);
        console.log(`Storage: Removed corrupted data for ${key}`);
      } catch (removeError) {
        console.error('Storage: Failed to remove corrupted data:', removeError);
      }
      
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }

      await AsyncStorage.removeItem(key);
      console.log(`Storage: Successfully removed ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, `removeItem(${key})`);
      throw new Error(`Failed to remove ${key}: ${errorMessage}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('Storage: Successfully cleared all data');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'clear()');
      throw new Error(`Failed to clear storage: ${errorMessage}`);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'getAllKeys()');
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      if (!Array.isArray(keys)) {
        throw new Error('Keys must be an array');
      }

      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'multiGet()');
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      if (!Array.isArray(keyValuePairs)) {
        throw new Error('Key-value pairs must be an array');
      }

      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'multiSet()');
      throw new Error(`Failed to multi-set: ${errorMessage}`);
    }
  }

  // Cache management with enhanced error handling
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      }
      
      const sizeInMB = totalSize / (1024 * 1024);
      console.log(`Storage: Cache size: ${sizeInMB.toFixed(2)}MB`);
      return sizeInMB;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'getCacheSize()');
      return 0;
    }
  }

  async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const now = Date.now();
      let removedCount = 0;
      
      for (const key of keys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          try {
            const cacheItem: CacheItem<any> = JSON.parse(item);
            if (cacheItem.expiresAt && now > cacheItem.expiresAt) {
              await AsyncStorage.removeItem(key);
              removedCount++;
            }
          } catch (parseError) {
            // If item is not a cache item, skip it
            continue;
          }
        }
      }
      
      console.log(`Storage: Cleaned up ${removedCount} expired items`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'cleanupExpiredCache()');
    }
  }

  async clearOldCache(): Promise<void> {
    try {
      const currentSize = await this.getCacheSize();
      const maxSize = this.config.maxSize || 50;
      
      if (currentSize > maxSize) {
        const keys = await AsyncStorage.getAllKeys();
        const items: Array<{ key: string; timestamp: number }> = [];
        
        for (const key of keys) {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            try {
              const cacheItem: CacheItem<any> = JSON.parse(item);
              items.push({ key, timestamp: cacheItem.timestamp });
            } catch (parseError) {
              // Skip non-cache items
              continue;
            }
          }
        }
        
        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest items until we're under the limit
        for (const item of items) {
          await AsyncStorage.removeItem(item.key);
          const newSize = await this.getCacheSize();
          if (newSize <= maxSize) {
            break;
          }
        }
        
        console.log(`Storage: Cleared old cache, new size: ${await this.getCacheSize()}MB`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      errorHandler.handleStorageError(error, 'clearOldCache()');
    }
  }

  // Theme-specific methods with error handling
  async cacheThemeMode(mode: string): Promise<void> {
    try {
      await this.setItem('theme_mode', mode);
    } catch (error) {
      errorHandler.logError(
        'Theme Cache Error',
        `Failed to cache theme mode: ${mode}`,
        'low',
        { mode, error: error instanceof Error ? error.message : 'Unknown error' },
        'StorageManager'
      );
    }
  }

  async getCachedThemeMode(): Promise<string | null> {
    try {
      return await this.getItem<string>('theme_mode');
    } catch (error) {
      errorHandler.logError(
        'Theme Cache Error',
        'Failed to get cached theme mode',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'StorageManager'
      );
      return null;
    }
  }

  // User data methods with error handling
  async saveUserData(userId: string, data: any): Promise<void> {
    try {
      const key = `user_${userId}`;
      await this.setItem(key, data);
    } catch (error) {
      errorHandler.logError(
        'User Data Save Error',
        `Failed to save user data for ${userId}`,
        'medium',
        { userId, error: error instanceof Error ? error.message : 'Unknown error' },
        'StorageManager'
      );
      throw error;
    }
  }

  async getUserData(userId: string): Promise<any | null> {
    try {
      const key = `user_${userId}`;
      return await this.getItem(key);
    } catch (error) {
      errorHandler.logError(
        'User Data Load Error',
        `Failed to load user data for ${userId}`,
        'medium',
        { userId, error: error instanceof Error ? error.message : 'Unknown error' },
        'StorageManager'
      );
      return null;
    }
  }

  // Validation methods
  async validateStorage(): Promise<boolean> {
    try {
      const testKey = '__storage_test__';
      const testValue = { test: true, timestamp: Date.now() };
      
      await this.setItem(testKey, testValue);
      const retrieved = await this.getItem(testKey);
      await this.removeItem(testKey);
      
      return retrieved && retrieved.test === true;
    } catch (error) {
      errorHandler.logError(
        'Storage Validation Error',
        'Storage validation failed',
        'high',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'StorageManager'
      );
      return false;
    }
  }

  // Health check method
  async getStorageHealth(): Promise<{
    isHealthy: boolean;
    size: number;
    itemCount: number;
    errors: string[];
  }> {
    const health = {
      isHealthy: true,
      size: 0,
      itemCount: 0,
      errors: [] as string[],
    };

    try {
      health.size = await this.getCacheSize();
      const keys = await this.getAllKeys();
      health.itemCount = keys.length;
      
      // Test storage functionality
      const isValid = await this.validateStorage();
      if (!isValid) {
        health.isHealthy = false;
        health.errors.push('Storage validation failed');
      }
    } catch (error) {
      health.isHealthy = false;
      health.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return health;
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance(); 