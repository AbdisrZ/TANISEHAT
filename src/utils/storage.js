import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@tanisehat_scan_history';

export const saveToHistory = async (entry) => {
  try {
    const existing = await getHistory();
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...existing].slice(0, 50);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (_e) {
    return null;
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (_e) {
    return [];
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    const existing = await getHistory();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (_e) {
    // silently fail
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (_e) {
    // silently fail
  }
};
