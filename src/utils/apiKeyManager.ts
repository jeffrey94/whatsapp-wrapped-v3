const STORAGE_KEY = 'gemini_api_key';

export const apiKeyManager = {
  get: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  set: (key: string): void => {
    try {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } catch {
      console.error('Failed to save API key to localStorage');
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error('Failed to clear API key from localStorage');
    }
  },

  exists: (): boolean => {
    try {
      const key = localStorage.getItem(STORAGE_KEY);
      return !!key && key.trim().length > 0;
    } catch {
      return false;
    }
  },
};
