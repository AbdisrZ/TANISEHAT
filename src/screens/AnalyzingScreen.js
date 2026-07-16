import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { COLORS } from '../constants/colors';

const PLANTNET_API_KEY = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;

const LOADING_MESSAGES = [
  'Mengirim foto ke server PlantNet...',
  'AI sedang menganalisis daunmu...',
  'Mencocokkan dengan database tanaman...',
  'Hampir selesai...',
];

export default function AnalyzingScreen({ route, navigation }) {
  const { photoUri } = route.params || {};
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!photoUri) {
      Alert.alert('Error', 'Foto tidak ditemukan!');
      navigation.goBack();
      return;
    }

    const analyzeImage = async () => {
      try {
        const formData = new FormData();
        formData.append('images', {
          uri: photoUri,
          name: 'leaf_photo.jpg',
          type: 'image/jpeg',
        });
        formData.append('organs', 'leaf');

        const response = await fetch(
          `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&include-related-images=false`,
          {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
          const best = data.results[0];
          const species = best.species || {};

          const resultData = {
            plantName: species.commonNames?.[0] || species.scientificNameWithoutAuthor || 'Tanaman Tidak Dikenal',
            scientificName: species.scientificNameWithoutAuthor || '-',
            confidence: (best.score * 100).toFixed(1),
            genus: species.genus?.scientificNameWithoutAuthor || '-',
            family: species.family?.scientificNameWithoutAuthor || '-',
            photoUri,
          };

          navigation.replace('Result', { resultData });
        } else {
          Alert.alert(
            'Tidak Teridentifikasi',
            'AI tidak dapat mengenali tanaman ini.\n\nCoba foto ulang dengan:\n• Pencahayaan lebih baik\n• Daun lebih dekat & fokus\n• Latar belakang lebih kontras',
            [{ text: 'Coba Lagi', onPress: () => navigation.replace('Scan') }]
          );
        }
      } catch {
        Alert.alert(
          'Gagal Terhubung',
          'Tidak dapat terhubung ke server. Pastikan koneksi internetmu aktif.',
          [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
        );
      }
    };

    analyzeImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} blurRadius={2} />
      )}
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.primaryLight} />
            <View style={styles.scanningRing} />
          </View>
          <Text style={styles.message}>{LOADING_MESSAGES[msgIndex]}</Text>
          <Text style={styles.submessage}>Menggunakan teknologi PlantNet AI 🌿</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  loaderWrap: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanningRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primaryPale,
    borderStyle: 'dashed',
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
