import AsyncStorage from '@react-native-async-storage/async-storage';

const CARE_KEY = '@tanisehat_plant_care';
const CARE_LOG_PREFIX = '@tanisehat_care_log_';
const TODAY_STATUS_PREFIX = '@tanisehat_today_status_';

// ─── Plant Care List ────────────────────────────────────────────────────────

export const getPlantCareList = async () => {
  try {
    const data = await AsyncStorage.getItem(CARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (_e) {
    return [];
  }
};

export const addPlantCare = async (plant) => {
  try {
    const existing = await getPlantCareList();
    // Cek duplikat berdasarkan nama ilmiah
    const duplicate = existing.find(
      (p) => p.scientificName?.toLowerCase() === plant.scientificName?.toLowerCase()
    );
    if (duplicate) return { success: false, reason: 'duplicate', existing: duplicate };

    const newEntry = {
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      plantName: plant.plantName || 'Tanaman Tidak Dikenal',
      scientificName: plant.scientificName || '-',
      photoUri: plant.photoUri || null,
      schedules: {
        watering: {
          enabled: true,
          intervalDays: 1,
          time: '07:00',
          notificationId: null,
        },
        fertilizing: {
          enabled: true,
          intervalDays: 14,
          time: '08:00',
          notificationId: null,
        },
        custom: [],
      },
    };

    const updated = [newEntry, ...existing].slice(0, 30);
    await AsyncStorage.setItem(CARE_KEY, JSON.stringify(updated));
    return { success: true, entry: newEntry };
  } catch (_e) {
    return { success: false, reason: 'error' };
  }
};

export const updatePlantCare = async (id, updates) => {
  try {
    const existing = await getPlantCareList();
    const updated = existing.map((p) => (p.id === id ? { ...p, ...updates } : p));
    await AsyncStorage.setItem(CARE_KEY, JSON.stringify(updated));
    return true;
  } catch (_e) {
    return false;
  }
};

export const deletePlantCare = async (id) => {
  try {
    const existing = await getPlantCareList();
    const updated = existing.filter((p) => p.id !== id);
    await AsyncStorage.setItem(CARE_KEY, JSON.stringify(updated));
    // Hapus juga log dan today status
    await AsyncStorage.removeItem(CARE_LOG_PREFIX + id);
    await AsyncStorage.removeItem(TODAY_STATUS_PREFIX + id);
    return true;
  } catch (_e) {
    return false;
  }
};

export const getPlantCareById = async (id) => {
  try {
    const list = await getPlantCareList();
    return list.find((p) => p.id === id) || null;
  } catch (_e) {
    return null;
  }
};

// ─── Today Status (Checklist Harian) ───────────────────────────────────────

const getTodayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export const getTodayStatus = async (plantCareId) => {
  try {
    const raw = await AsyncStorage.getItem(TODAY_STATUS_PREFIX + plantCareId);
    if (!raw) return { date: getTodayKey(), watered: false, fertilized: false, customDone: {} };
    const parsed = JSON.parse(raw);
    // Reset jika bukan hari ini
    if (parsed.date !== getTodayKey()) {
      return { date: getTodayKey(), watered: false, fertilized: false, customDone: {} };
    }
    return parsed;
  } catch (_e) {
    return { date: getTodayKey(), watered: false, fertilized: false, customDone: {} };
  }
};

export const updateTodayStatus = async (plantCareId, statusUpdate) => {
  try {
    const current = await getTodayStatus(plantCareId);
    const updated = { ...current, ...statusUpdate, date: getTodayKey() };
    await AsyncStorage.setItem(TODAY_STATUS_PREFIX + plantCareId, JSON.stringify(updated));
    return updated;
  } catch (_e) {
    return null;
  }
};

// ─── Care Log (Riwayat Perawatan) ──────────────────────────────────────────

export const getCareLog = async (plantCareId) => {
  try {
    const raw = await AsyncStorage.getItem(CARE_LOG_PREFIX + plantCareId);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
};

export const addCareLog = async (plantCareId, type, label) => {
  try {
    const existing = await getCareLog(plantCareId);
    const entry = {
      id: Date.now().toString(),
      plantCareId,
      type,
      label,
      doneAt: new Date().toISOString(),
    };
    const updated = [entry, ...existing].slice(0, 200);
    await AsyncStorage.setItem(CARE_LOG_PREFIX + plantCareId, JSON.stringify(updated));
    return entry;
  } catch (_e) {
    return null;
  }
};
