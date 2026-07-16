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
import { getHistory, deleteHistoryItem, clearHistory } from '../utils/storage';

function formatTimestamp(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 172800) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ConfidenceBadge({ confidence }) {
  const pct = parseFloat(confidence);
  const color = pct >= 80 ? COLORS.success : pct >= 60 ? COLORS.warning : COLORS.danger;
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <Text style={[styles.badgeText, { color }]}>{confidence}%</Text>
    </View>
  );
}

function HistoryCard({ item, onDelete, onNavigate }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onNavigate(item)}
      activeOpacity={0.85}
    >
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
          <Text style={{ fontSize: 24 }}>🌿</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.plantName} numberOfLines={1}>{item.plantName}</Text>
        <Text style={styles.sciName} numberOfLines={1}>{item.scientificName}</Text>
        {item.family && item.family !== '-' && (
          <Text style={styles.familyText} numberOfLines={1}>Famili: {item.family}</Text>
        )}
        <View style={styles.cardBottom}>
          <ConfidenceBadge confidence={item.confidence} />
          <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.gray500} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EmptyState({ onScan }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 52 }}>📷</Text>
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
      <Text style={styles.emptyDesc}>
        Mulai scan tanaman pertamamu untuk melihat riwayat identifikasi di sini.
      </Text>
      <TouchableOpacity style={styles.emptyScanBtn} onPress={onScan} activeOpacity={0.85}>
        <Ionicons name="camera" size={18} color="#fff" />
        <Text style={styles.emptyScanBtnText}>Scan Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Hapus Riwayat', 'Hapus entri ini dari riwayat scan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteHistoryItem(id);
          setHistory((prev) => prev.filter((h) => h.id !== id));
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert('Hapus Semua', 'Yakin ingin menghapus semua riwayat scan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus Semua',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  };

  const handleNavigate = (item) => {
    navigation.navigate('ScanDetail', { item });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Riwayat Scan</Text>
          <Text style={styles.headerSub}>{history.length} tanaman teridentifikasi</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.scanIconBtn}
            onPress={() => navigation.navigate('Scan')}
          >
            <Ionicons name="camera" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          {history.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Ionicons name="trash" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {history.length === 0 ? (
        <EmptyState onScan={() => navigation.navigate('Scan')} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onDelete={handleDelete}
              onNavigate={handleNavigate}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  scanIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    padding: 16,
    gap: 12,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImg: {
    width: 90,
    height: 90,
  },
  cardImgPlaceholder: {
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  plantName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sciName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: 1,
  },
  familyText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 14,
  },
  emptyIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyScanBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  emptyScanBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
