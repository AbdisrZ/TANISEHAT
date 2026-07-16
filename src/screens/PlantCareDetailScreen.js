import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import {
  getPlantCareById,
  getTodayStatus,
  updateTodayStatus,
  getCareLog,
  addCareLog,
} from '../utils/careStorage';
import {
  updateWateringSchedule,
  updateFertilizingSchedule,
  addCustomSchedule,
  removeCustomSchedule,
} from '../utils/notificationService';

// ─── Konstanta interval ────────────────────────────────────────────────────

const WATER_INTERVALS = [
  { label: 'Setiap hari', days: 1 },
  { label: 'Setiap 2 hari', days: 2 },
  { label: 'Setiap 3 hari', days: 3 },
  { label: 'Setiap minggu', days: 7 },
];

const FERTILIZE_INTERVALS = [
  { label: 'Setiap minggu', days: 7 },
  { label: 'Setiap 2 minggu', days: 14 },
  { label: 'Setiap bulan', days: 30 },
];

// ─── Sub-komponen ──────────────────────────────────────────────────────────

function ChecklistItem({ icon, label, done, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.checkItem, done && styles.checkItemDone]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={[styles.checkBox, done && styles.checkBoxDone]}>
        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.checkIcon}>{icon}</Text>
      <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>{label}</Text>
      {done && (
        <View style={styles.doneTag}>
          <Text style={styles.doneTagText}>Selesai</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ScheduleRow({ icon, label, schedule, intervals, onToggle, onIntervalChange, onTimeChange }) {
  return (
    <View style={styles.scheduleRow}>
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleIcon}>{icon}</Text>
        <Text style={styles.scheduleLabel}>{label}</Text>
        <Switch
          value={schedule.enabled}
          onValueChange={onToggle}
          thumbColor={schedule.enabled ? COLORS.primary : COLORS.gray300}
          trackColor={{ false: COLORS.gray300, true: COLORS.primaryPale }}
        />
      </View>
      {schedule.enabled && (
        <View style={styles.scheduleOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {intervals.map((opt) => (
              <TouchableOpacity
                key={opt.days}
                style={[styles.chip, schedule.intervalDays === opt.days && styles.chipActive]}
                onPress={() => onIntervalChange(opt.days)}
              >
                <Text style={[styles.chipText, schedule.intervalDays === opt.days && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.timeBtn} onPress={onTimeChange}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.timeBtnText}>Jam {schedule.time}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function LogItem({ log }) {
  const typeIcon = log.type === 'watering' ? '💧' : log.type === 'fertilizing' ? '🌱' : '🌿';
  const date = new Date(log.doneAt);
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.logItem}>
      <Text style={styles.logIcon}>{typeIcon}</Text>
      <View style={styles.logInfo}>
        <Text style={styles.logLabel}>{log.label}</Text>
        <Text style={styles.logDate}>{dateStr}, {timeStr}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function PlantCareDetailScreen({ route, navigation }) {
  const { plantId } = route.params || {};
  const [plant, setPlant] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [careLog, setCareLog] = useState([]);
  const [activeTab, setActiveTab] = useState('checklist');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customInterval, setCustomInterval] = useState(7);

  const loadData = useCallback(async () => {
    if (!plantId) return;
    const [p, status, log] = await Promise.all([
      getPlantCareById(plantId),
      getTodayStatus(plantId),
      getCareLog(plantId),
    ]);
    setPlant(p);
    setTodayStatus(status);
    setCareLog(log);
  }, [plantId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!plant) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat data tanaman...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Checklist handlers ────────────────────────────────────────────────

  const handleToggleWater = async () => {
    if (todayStatus?.watered) return; // sudah dilakukan, tidak bisa di-undo
    const updated = await updateTodayStatus(plantId, { watered: true });
    await addCareLog(plantId, 'watering', 'Penyiraman');
    setTodayStatus(updated);
    setCareLog(await getCareLog(plantId));
  };

  const handleToggleFertilize = async () => {
    if (todayStatus?.fertilized) return;
    const updated = await updateTodayStatus(plantId, { fertilized: true });
    await addCareLog(plantId, 'fertilizing', 'Pemupukan');
    setTodayStatus(updated);
    setCareLog(await getCareLog(plantId));
  };

  const handleToggleCustom = async (customId, label) => {
    const currentDone = todayStatus?.customDone?.[customId];
    if (currentDone) return;
    const updated = await updateTodayStatus(plantId, {
      customDone: { ...todayStatus?.customDone, [customId]: true },
    });
    await addCareLog(plantId, 'custom', label);
    setTodayStatus(updated);
    setCareLog(await getCareLog(plantId));
  };

  // ─── Schedule handlers ─────────────────────────────────────────────────

  const handleWateringToggle = async (enabled) => {
    const newSched = { ...plant.schedules.watering, enabled };
    const updatedSchedules = await updateWateringSchedule(plant, newSched);
    setPlant((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleWateringInterval = async (days) => {
    const newSched = { ...plant.schedules.watering, intervalDays: days };
    const updatedSchedules = await updateWateringSchedule(plant, newSched);
    setPlant((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleFertilizingToggle = async (enabled) => {
    const newSched = { ...plant.schedules.fertilizing, enabled };
    const updatedSchedules = await updateFertilizingSchedule(plant, newSched);
    setPlant((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleFertilizingInterval = async (days) => {
    const newSched = { ...plant.schedules.fertilizing, intervalDays: days };
    const updatedSchedules = await updateFertilizingSchedule(plant, newSched);
    setPlant((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleAddCustom = async () => {
    if (!customLabel.trim()) {
      Alert.alert('Nama Diperlukan', 'Masukkan nama jenis perawatan kustom.');
      return;
    }
    await addCustomSchedule(plant, {
      label: customLabel.trim(),
      intervalDays: customInterval,
      time: '09:00',
      enabled: true,
    });
    setShowCustomModal(false);
    setCustomLabel('');
    setCustomInterval(7);
    const updated = await getPlantCareById(plantId);
    setPlant(updated);
  };

  const handleRemoveCustom = (customId, label) => {
    Alert.alert('Hapus Jadwal', `Hapus jadwal "${label}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const updatedSchedules = await removeCustomSchedule(plant, customId);
          setPlant((prev) => ({ ...prev, schedules: updatedSchedules }));
        },
      },
    ]);
  };

  const { watering, fertilizing, custom = [] } = plant.schedules;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detail Perawatan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Plant Info Card */}
        <View style={styles.infoCard}>
          {plant.photoUri ? (
            <Image source={{ uri: plant.photoUri }} style={styles.plantPhoto} />
          ) : (
            <View style={[styles.plantPhoto, styles.plantPhotoPlaceholder]}>
              <Ionicons name="leaf" size={36} color={COLORS.primaryLight} />
            </View>
          )}
          <View style={styles.plantMeta}>
            <Text style={styles.plantName}>{plant.plantName}</Text>
            <Text style={styles.plantSci}>{plant.scientificName}</Text>
            <Text style={styles.plantDate}>
              Ditambahkan {new Date(plant.addedAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {[
            { key: 'checklist', label: 'Hari Ini', icon: 'checkbox-outline' },
            { key: 'schedule', label: 'Jadwal', icon: 'calendar-outline' },
            { key: 'log', label: 'Riwayat', icon: 'time-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? COLORS.primary : COLORS.gray500}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── TAB: Checklist Hari Ini ─── */}
        {activeTab === 'checklist' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perawatan Hari Ini</Text>
            <ChecklistItem
              icon="💧"
              label="Penyiraman"
              done={todayStatus?.watered}
              onToggle={handleToggleWater}
            />
            <ChecklistItem
              icon="🌱"
              label="Pemupukan"
              done={todayStatus?.fertilized}
              onToggle={handleToggleFertilize}
            />
            {custom.map((c) => (
              <ChecklistItem
                key={c.id}
                icon="🌿"
                label={c.label}
                done={todayStatus?.customDone?.[c.id]}
                onToggle={() => handleToggleCustom(c.id, c.label)}
              />
            ))}
            {custom.length === 0 && (
              <Text style={styles.emptyNote}>
                Belum ada perawatan kustom. Tambahkan di tab Jadwal.
              </Text>
            )}
          </View>
        )}

        {/* ─── TAB: Jadwal ─── */}
        {activeTab === 'schedule' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pengaturan Jadwal</Text>

            <View style={styles.scheduleCard}>
              <ScheduleRow
                icon="💧"
                label="Penyiraman"
                schedule={watering}
                intervals={WATER_INTERVALS}
                onToggle={handleWateringToggle}
                onIntervalChange={handleWateringInterval}
                onTimeChange={() => Alert.alert('Info', 'Tap untuk mengatur jam notifikasi penyiraman (dalam pengembangan).')}
              />
            </View>

            <View style={styles.scheduleCard}>
              <ScheduleRow
                icon="🌱"
                label="Pemupukan"
                schedule={fertilizing}
                intervals={FERTILIZE_INTERVALS}
                onToggle={handleFertilizingToggle}
                onIntervalChange={handleFertilizingInterval}
                onTimeChange={() => Alert.alert('Info', 'Tap untuk mengatur jam notifikasi pemupukan (dalam pengembangan).')}
              />
            </View>

            <Text style={styles.sectionSubtitle}>Perawatan Kustom</Text>
            {custom.map((c) => (
              <View key={c.id} style={styles.customItem}>
                <Text style={styles.customIcon}>🌿</Text>
                <View style={styles.customInfo}>
                  <Text style={styles.customLabel}>{c.label}</Text>
                  <Text style={styles.customSub}>
                    Setiap {c.intervalDays} hari · jam {c.time}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveCustom(c.id, c.label)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addCustomBtn}
              onPress={() => setShowCustomModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.addCustomText}>Tambah Jadwal Kustom</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── TAB: Riwayat ─── */}
        {activeTab === 'log' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Perawatan</Text>
            {careLog.length === 0 ? (
              <View style={styles.logEmpty}>
                <Ionicons name="time-outline" size={40} color={COLORS.primaryPale} />
                <Text style={styles.logEmptyText}>Belum ada riwayat perawatan.</Text>
                <Text style={styles.logEmptySubtext}>
                  Tandai perawatan sebagai selesai di tab "Hari Ini" untuk mencatat riwayat.
                </Text>
              </View>
            ) : (
              careLog.map((log) => <LogItem key={log.id} log={log} />)
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal Tambah Kustom */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tambah Jadwal Kustom</Text>

            <Text style={styles.modalLabel}>Nama Perawatan</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Pangkas, Semprot, Ganti Media"
              placeholderTextColor={COLORS.gray500}
              value={customLabel}
              onChangeText={setCustomLabel}
              maxLength={40}
            />

            <Text style={styles.modalLabel}>Interval</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {[3, 7, 14, 30].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, customInterval === d && styles.chipActive]}
                  onPress={() => setCustomInterval(d)}
                >
                  <Text style={[styles.chipText, customInterval === d && styles.chipTextActive]}>
                    {d === 3 ? '3 hari' : d === 7 ? 'Mingguan' : d === 14 ? '2 minggu' : 'Bulanan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowCustomModal(false); setCustomLabel(''); }}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddCustom}>
                <Text style={styles.modalConfirmText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textLight, fontSize: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.textDark },

  scroll: { flex: 1 },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  plantPhoto: { width: 72, height: 72, borderRadius: 12, backgroundColor: COLORS.primaryBg },
  plantPhotoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  plantMeta: { flex: 1, gap: 3 },
  plantName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  plantSci: { fontSize: 12, fontStyle: 'italic', color: COLORS.textLight },
  plantDate: { fontSize: 11, color: COLORS.gray500, marginTop: 2 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  tabActive: { backgroundColor: COLORS.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.gray500 },
  tabTextActive: { color: COLORS.primary },

  section: { marginHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMedium, marginTop: 8 },
  emptyNote: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', paddingVertical: 12 },

  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  checkItemDone: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primaryLight },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkIcon: { fontSize: 18 },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  checkLabelDone: { color: COLORS.textLight, textDecorationLine: 'line-through' },
  doneTag: { backgroundColor: COLORS.primaryLight + '30', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  doneTagText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  scheduleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleRow: { gap: 10 },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scheduleIcon: { fontSize: 18 },
  scheduleLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  scheduleOptions: { gap: 8 },
  chipScroll: { marginLeft: 26 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  chipActive: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray500 },
  chipTextActive: { color: COLORS.primary },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 26,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timeBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  customItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customIcon: { fontSize: 18 },
  customInfo: { flex: 1 },
  customLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  customSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addCustomText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logIcon: { fontSize: 20 },
  logInfo: { flex: 1 },
  logLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  logDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  logEmpty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  logEmptyText: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  logEmptySubtext: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMedium },
  modalInput: {
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.textMedium },
  modalConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
