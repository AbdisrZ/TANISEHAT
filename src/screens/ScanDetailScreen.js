import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { deleteHistoryItem } from '../utils/storage';

function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ', ' + date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConfidenceBadge({ confidence }) {
  const pct = parseFloat(confidence);
  const color = pct >= 80 ? COLORS.success : pct >= 60 ? COLORS.warning : COLORS.danger;
  const label = pct >= 80 ? 'Akurasi Tinggi' : pct >= 60 ? 'Akurasi Sedang' : 'Akurasi Rendah';
  return (
    <View style={[styles.confBadge, { backgroundColor: color + '18' }]}>
      <View style={[styles.confDot, { backgroundColor: color }]} />
      <Text style={[styles.confLabel, { color }]}>{confidence}% — {label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value || value === '-') return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={15} color={COLORS.primaryLight} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ScanDetailScreen({ route, navigation }) {
  const { item } = route.params || {};

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text>Data tidak ditemukan.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Hapus Riwayat', 'Hapus entri ini dari riwayat scan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteHistoryItem(item.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const pct = parseFloat(item.confidence);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Photo */}
        <View style={styles.photoWrap}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={{ fontSize: 64 }}>🌿</Text>
            </View>
          )}
          <View style={styles.photoOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultTag}>HASIL IDENTIFIKASI</Text>
            <Text style={styles.plantName}>{item.plantName}</Text>
            <Text style={styles.scientificName}>{item.scientificName}</Text>
            <ConfidenceBadge confidence={item.confidence} />

            <View style={styles.divider} />

            <InfoRow icon="git-branch-outline" label="Genus" value={item.genus} />
            <InfoRow icon="layers-outline" label="Famili" value={item.family} />

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="calendar-outline" size={15} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.infoLabel}>Waktu Scan</Text>
              <Text style={[styles.infoValue, { fontStyle: 'normal' }]}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>

            {pct < 60 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Akurasi rendah. Hasil identifikasi mungkin kurang tepat.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('Recommendation', {
                plantName: item.plantName,
                scientificName: item.scientificName,
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Panduan Perawatan AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Scan')}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Scan Tanaman Baru</Text>
          </TouchableOpacity>

        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  photoWrap: {
    height: 280,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(214,40,40,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    gap: 12,
  },

  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  resultTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 1,
  },
  plantName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 32,
  },
  scientificName: {
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  confBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  confDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    width: 72,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    fontStyle: 'italic',
    flex: 1,
  },

  warningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.warning + '15',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
