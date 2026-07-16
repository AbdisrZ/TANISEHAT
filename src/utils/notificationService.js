import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updatePlantCare } from './careStorage';

// Konfigurasi handler notifikasi saat app aktif
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Izin Notifikasi ────────────────────────────────────────────────────────

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('plant-care', {
      name: 'Perawatan Tanaman',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D6A4F',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// ─── Jadwal Notifikasi ──────────────────────────────────────────────────────

/**
 * Jadwalkan notifikasi berulang berdasarkan interval hari dan jam.
 * @param {string} title - Judul notifikasi
 * @param {string} body - Isi notifikasi
 * @param {string} time - Format "HH:MM"
 * @param {number} intervalDays - Interval hari (1, 2, 3, 7, 14, 30)
 * @returns {string|null} notificationId atau null jika gagal
 */
export const scheduleRepeatingNotification = async (title, body, time, intervalDays) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'plant-care' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalDays * 24 * 60 * 60,
        repeats: true,
      },
    });
    return notificationId;
  } catch (_e) {
    return null;
  }
};

/**
 * Batalkan notifikasi berdasarkan ID.
 */
export const cancelNotification = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (_e) {
    // silently fail
  }
};

/**
 * Batalkan semua notifikasi milik satu tanaman (siram + pupuk + semua custom).
 */
export const cancelAllPlantNotifications = async (plant) => {
  if (!plant?.schedules) return;
  const { watering, fertilizing, custom = [] } = plant.schedules;
  if (watering?.notificationId) await cancelNotification(watering.notificationId);
  if (fertilizing?.notificationId) await cancelNotification(fertilizing.notificationId);
  for (const c of custom) {
    if (c.notificationId) await cancelNotification(c.notificationId);
  }
};

// ─── Setup & Update Jadwal per Tanaman ─────────────────────────────────────

/**
 * Setup notifikasi siram dan pupuk setelah tanaman ditambahkan.
 * Simpan notificationId kembali ke storage.
 */
export const setupDefaultNotifications = async (plant) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return plant;

  const { watering, fertilizing } = plant.schedules;
  let updatedSchedules = { ...plant.schedules };

  if (watering.enabled) {
    const nid = await scheduleRepeatingNotification(
      `Waktunya menyiram ${plant.plantName}! 💧`,
      `Jangan lupa siram ${plant.plantName} hari ini ya.`,
      watering.time,
      watering.intervalDays
    );
    updatedSchedules = {
      ...updatedSchedules,
      watering: { ...watering, notificationId: nid },
    };
  }

  if (fertilizing.enabled) {
    const nid = await scheduleRepeatingNotification(
      `Waktu pemupukan ${plant.plantName}! 🌱`,
      `Saatnya memupuk ${plant.plantName} supaya tumbuh subur.`,
      fertilizing.time,
      fertilizing.intervalDays
    );
    updatedSchedules = {
      ...updatedSchedules,
      fertilizing: { ...fertilizing, notificationId: nid },
    };
  }

  await updatePlantCare(plant.id, { schedules: updatedSchedules });
  return { ...plant, schedules: updatedSchedules };
};

/**
 * Update jadwal notifikasi penyiraman.
 */
export const updateWateringSchedule = async (plant, newSchedule) => {
  await cancelNotification(plant.schedules.watering?.notificationId);

  let notificationId = null;
  if (newSchedule.enabled) {
    notificationId = await scheduleRepeatingNotification(
      `Waktunya menyiram ${plant.plantName}! 💧`,
      `Jangan lupa siram ${plant.plantName} hari ini ya.`,
      newSchedule.time,
      newSchedule.intervalDays
    );
  }

  const updatedSchedules = {
    ...plant.schedules,
    watering: { ...newSchedule, notificationId },
  };
  await updatePlantCare(plant.id, { schedules: updatedSchedules });
  return updatedSchedules;
};

/**
 * Update jadwal notifikasi pemupukan.
 */
export const updateFertilizingSchedule = async (plant, newSchedule) => {
  await cancelNotification(plant.schedules.fertilizing?.notificationId);

  let notificationId = null;
  if (newSchedule.enabled) {
    notificationId = await scheduleRepeatingNotification(
      `Waktu pemupukan ${plant.plantName}! 🌱`,
      `Saatnya memupuk ${plant.plantName} supaya tumbuh subur.`,
      newSchedule.time,
      newSchedule.intervalDays
    );
  }

  const updatedSchedules = {
    ...plant.schedules,
    fertilizing: { ...newSchedule, notificationId },
  };
  await updatePlantCare(plant.id, { schedules: updatedSchedules });
  return updatedSchedules;
};

/**
 * Tambah jadwal perawatan kustom.
 */
export const addCustomSchedule = async (plant, customSchedule) => {
  const id = Date.now().toString();
  let notificationId = null;

  if (customSchedule.enabled) {
    notificationId = await scheduleRepeatingNotification(
      `Perawatan ${plant.plantName}: ${customSchedule.label} 🌿`,
      `Waktunya melakukan "${customSchedule.label}" untuk ${plant.plantName}.`,
      customSchedule.time,
      customSchedule.intervalDays
    );
  }

  const newCustom = { ...customSchedule, id, notificationId };
  const updatedSchedules = {
    ...plant.schedules,
    custom: [...(plant.schedules.custom || []), newCustom],
  };
  await updatePlantCare(plant.id, { schedules: updatedSchedules });
  return updatedSchedules;
};

/**
 * Hapus satu jadwal kustom.
 */
export const removeCustomSchedule = async (plant, customId) => {
  const target = plant.schedules.custom?.find((c) => c.id === customId);
  if (target?.notificationId) await cancelNotification(target.notificationId);

  const updatedSchedules = {
    ...plant.schedules,
    custom: (plant.schedules.custom || []).filter((c) => c.id !== customId),
  };
  await updatePlantCare(plant.id, { schedules: updatedSchedules });
  return updatedSchedules;
};
