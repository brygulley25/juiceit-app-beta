// Safe storage utility that works across all platforms
class SafeStorage {
  private isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (!this.isAvailable()) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (!this.isAvailable()) return;
      window.localStorage.setItem(key, value);
      console.log(`Storage: Successfully saved ${key}`);
    } catch {
      console.log(`Storage: Failed to save ${key} - localStorage not available`);
    }
  }

  removeItem(key: string): void {
    try {
      if (!this.isAvailable()) return;
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
}

export const safeStorage = new SafeStorage();