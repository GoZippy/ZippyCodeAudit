/**
 * Storage Utilities - Lightweight data persistence
 * Handles local storage and caching for dashboard data
 */

// Storage keys
const STORAGE_KEYS = {
  THEME: 'zippycodesaudit-theme',
  REFRESH_INTERVAL: 'zippycodesaudit-refresh-interval',
  USER_PREFERENCES: 'zippycodesaudit-preferences',
  CACHE_DATA: 'zippycodesaudit-cache',
  LAST_UPDATE: 'zippycodesaudit-last-update'
};

/**
 * Local Storage wrapper with error handling
 */
const Storage = {
  /**
   * Get item from localStorage with fallback
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from storage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set ${key} in storage:`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from storage:`, error);
      return false;
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      return false;
    }
  }
};

/**
 * Cache management for dashboard data
 */
const Cache = {
  /**
   * Get cached data if not expired
   */
  get(key, maxAge = 5 * 60 * 1000) { // 5 minutes default
    const cached = Storage.get(STORAGE_KEYS.CACHE_DATA, {});
    const item = cached[key];

    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > maxAge) {
      // Cache expired
      delete cached[key];
      Storage.set(STORAGE_KEYS.CACHE_DATA, cached);
      return null;
    }

    return item.data;
  },

  /**
   * Set cached data
   */
  set(key, data) {
    const cached = Storage.get(STORAGE_KEYS.CACHE_DATA, {});
    cached[key] = {
      data,
      timestamp: Date.now()
    };
    Storage.set(STORAGE_KEYS.CACHE_DATA, cached);
  },

  /**
   * Clear all cached data
   */
  clear() {
    Storage.set(STORAGE_KEYS.CACHE_DATA, {});
  },

  /**
   * Get cache statistics
   */
  getStats() {
    const cached = Storage.get(STORAGE_KEYS.CACHE_DATA, {});
    const keys = Object.keys(cached);

    return {
      totalItems: keys.length,
      totalSize: JSON.stringify(cached).length,
      oldestItem: keys.length > 0 ?
        Math.min(...keys.map(key => cached[key].timestamp)) : null,
      newestItem: keys.length > 0 ?
        Math.max(...keys.map(key => cached[key].timestamp)) : null
    };
  }
};

/**
 * User preferences management
 */
const Preferences = {
  /**
   * Get user preferences with defaults
   */
  get() {
    return Storage.get(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'auto',
      refreshInterval: 60000,
      autoRefresh: true,
      compactMode: false,
      notifications: true
    });
  },

  /**
   * Set user preference
   */
  set(key, value) {
    const prefs = this.get();
    prefs[key] = value;
    Storage.set(STORAGE_KEYS.USER_PREFERENCES, prefs);
  },

  /**
   * Reset preferences to defaults
   */
  reset() {
    Storage.remove(STORAGE_KEYS.USER_PREFERENCES);
  },

  /**
   * Export preferences
   */
  export() {
    return this.get();
  },

  /**
   * Import preferences
   */
  import(prefs) {
    Storage.set(STORAGE_KEYS.USER_PREFERENCES, { ...this.get(), ...prefs });
  }
};

/**
 * Data persistence for dashboard state
 */
const DashboardStorage = {
  /**
   * Save current dashboard state
   */
  saveState(state) {
    try {
      const stateToSave = {
        currentPage: state.currentPage,
        lastUpdate: Date.now(),
        dataVersion: '1.0'
      };
      Storage.set(STORAGE_KEYS.LAST_UPDATE, stateToSave);
    } catch (error) {
      console.warn('Failed to save dashboard state:', error);
    }
  },

  /**
   * Load dashboard state
   */
  getState() {
    return Storage.get(STORAGE_KEYS.LAST_UPDATE, {
      currentPage: 'overview',
      lastUpdate: null
    });
  },

  /**
   * Check if data needs refresh
   */
  needsRefresh(maxAge = 5 * 60 * 1000) {
    const state = this.getState();
    if (!state.lastUpdate) return true;

    return Date.now() - state.lastUpdate > maxAge;
  },

  /**
   * Get last update time
   */
  getLastUpdate() {
    const state = this.getState();
    return state.lastUpdate;
  }
};

/**
 * Export data for backup or sharing
 */
const Exporter = {
  /**
   * Export all user data
   */
  exportAll() {
    return {
      preferences: Preferences.export(),
      cache: Storage.get(STORAGE_KEYS.CACHE_DATA, {}),
      state: DashboardStorage.getState(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  },

  /**
   * Import user data
   */
  importAll(data) {
    try {
      if (data.preferences) {
        Preferences.import(data.preferences);
      }
      if (data.cache) {
        Storage.set(STORAGE_KEYS.CACHE_DATA, data.cache);
      }
      if (data.state) {
        Storage.set(STORAGE_KEYS.LAST_UPDATE, data.state);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  /**
   * Create downloadable backup
   */
  createBackup() {
    const data = this.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zippycodesaudit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Export utilities
window.ZippyCodeAuditStorage = {
  Storage,
  Cache,
  Preferences,
  DashboardStorage,
  Exporter
};
