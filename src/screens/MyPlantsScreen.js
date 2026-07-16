import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { getPlantCareList, deletePlantCare, getTodayStatus } from '../utils/careStorage';
import { cancelAllPlantNotifications } from '../utils/notificationService';

function StatusBadge({ done, icon, label }) {
  return (
    <View style={[styles.badge, { backgroundColor: done ? COLORS.primaryBg : COLORS.gray200 }]}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={[styles.badgeText, { color: done ? COLORS.primary : COLORS.gray500 }]}>
        {done ? `Sudah ${label}` : `Belum ${label}`}
      </Text>
    </View>
  );
}

function PlantCard({ plant, todayStatus, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        {plant.photoUri ? (
          <Image source={{ uri: plant.photoUri }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhoto, styles.cardPhotoPlaceholder]}>
            <Ionicons name="leaf" size={28} color={COLORS.primaryLight} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{plant.plantName}</Text>
          <Text style={styles.cardSci} numberOfLines={1}>{plant.scientificName}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge done={todayStatus?.watered} icon="💧" label="disiram" />
            <StatusBadge done={todayStatus?.fertilized} icon="🌱" label="dipupuk" />
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDate}>
        Ditambahkan: {new Date(plant.addedAt).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </Text>
    </TouchableOpacity>
  );
}

export default function MyPlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [todayStatuses, setTodayStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const list = await getPlantCareList();
    setPlants(list);

    const statuses = {};
    await Promise.all(
      list.map(async (p) => {
        statuses[p.id] = await getTodayStatus(p.id);
      })
    );
    setTodayStatuses(statuses);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (plant) => {
    Alert.alert(
      'Hapus Tanaman',
      `Hapus "${plant.plantName}" dari daftar pemeliharaan? Semua jadwal notifikasi tanaman ini akan dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await cancelAllPlantNotifications(plant);
            await deletePlantCare(plant.id);
            loadData();
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color={COLORS.primaryPale} />
      <Text style={styles.emptyTitle}>Belum Ada Tanaman</Text>
      <Text style={styles.emptySubtitle}>
        Scan tanaman terlebih dahulu, lalu tap "Tambah ke Pemeliharaan" untuk mulai memantau perawatannya.
      </Text>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('Scan')}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={18} color="#fff" />
        <Text style={styles.scanBtnText}>Scan Tanaman Sekarang</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tanaman Saya</Text>
        <Text style={styles.headerSub}>
          {plants.length > 0 ? `${plants.length} tanaman dipantau` : 'Mulai pantau tanamanmu'}
        </Text>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            todayStatus={todayStatuses[item.id]}
            onPress={() => navigation.navigate('PlantCareDetail', { plantId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContent,
          plants.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardPhoto: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
  },
  cardPhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardSci: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  badgeIcon: {
    fontSize: 11,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.textLight,
    paddingLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
