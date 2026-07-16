import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { saveToHistory } from '../utils/storage';
import { addPlantCare } from '../utils/careStorage';
import { setupDefaultNotifications } from '../utils/notificationService';

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
      <Ionicons name={icon} size={16} color={COLORS.primaryLight} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const { resultData } = route.params || {};
  const savedRef = useRef(false);
  const [addedToCare, setAddedToCare] = useState(false);
  const [addingCare, setAddingCare] = useState(false);

  useEffect(() => {
    if (resultData && !savedRef.current) {
      savedRef.current = true;
      saveToHistory({
        plantName: resultData.plantName,
        scientificName: resultData.scientificName,
        confidence: resultData.confidence,
        genus: resultData.genus,
        family: resultData.family,
        photoUri: resultData.photoUri,
      });
    }
  }, [resultData]);

  const handleAddToCare = async () => {
    if (addingCare || addedToCare) return;
    setAddingCare(true);
    const result = await addPlantCare({
      plantName: resultData.plantName,
      scientificName: resultData.scientificName,
      photoUri: resultData.photoUri,
    });
    if (result.success) {
      await setupDefaultNotifications(result.entry);
      setAddedToCare(true);
      Alert.alert(
        'Ditambahkan ke Pemeliharaan',
        `${resultData.plantName} berhasil ditambahkan. Notifikasi perawatan akan dikirim sesuai jadwal.`,
        [
          { text: 'Lihat Jadwal', onPress: () => navigation.navigate('MyPlants') },
          { text: 'OK' },
        ]
      );
    } else if (result.reason === 'duplicate') {
      setAddedToCare(true);
      Alert.alert('Sudah Ada', `${resultData.plantName} sudah ada di daftar pemeliharaan kamu.`);
    } else {
      Alert.alert('Gagal', 'Tidak dapat menambahkan tanaman. Coba lagi.');
    }
    setAddingCare(false);
  };

  if (!resultData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Gagal memuat hasil.</Text>
      </View>
    );
  }

  const pct = parseFloat(resultData.confidence);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Photo */}
        <View style={styles.photoWrap}>
          <Image source={{ uri: resultData.photoUri }} style={styles.photo} />
          <View style={styles.photoOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Main')}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultTag}>HASIL IDENTIFIKASI</Text>
            <Text style={styles.plantName}>{resultData.plantName}</Text>
            <Text style={styles.scientificName}>{resultData.scientificName}</Text>
            <ConfidenceBadge confidence={resultData.confidence} />

            {(resultData.genus !== '-' || resultData.family !== '-') && (
              <>
                <View style={styles.divider} />
                <InfoRow icon="git-branch-outline" label="Genus" value={resultData.genus} />
                <InfoRow icon="layers-outline" label="Family" value={resultData.family} />
              </>
            )}

            {pct < 60 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Akurasi rendah. Coba foto ulang dengan pencahayaan lebih baik dan daun lebih fokus.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('Recommendation', {
                plantName: resultData.plantName,
                scientificName: resultData.scientificName,
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Panduan Perawatan AI</Text>
          </TouchableOpacity>

          {/* Tombol Tambah ke Pemeliharaan */}
          <TouchableOpacity
            style={[styles.careBtn, addedToCare && styles.careBtnDone]}
            onPress={handleAddToCare}
            activeOpacity={0.85}
            disabled={addingCare || addedToCare}
          >
            <Ionicons
              name={addedToCare ? 'checkmark-circle' : 'calendar-outline'}
              size={18}
              color={addedToCare ? COLORS.primary : COLORS.primary}
            />
            <Text style={styles.careBtnText}>
              {addingCare ? 'Menambahkan...' : addedToCare ? 'Sudah di Pemeliharaan' : 'Tambah ke Pemeliharaan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.replace('Scan')}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Scan Tanaman Lain</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.ghostBtnText}>Kembali ke Beranda</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  photoWrap: {
    height: 260,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    width: 54,
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
  careBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  careBtnDone: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryBg,
  },
  careBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  ghostBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
});
