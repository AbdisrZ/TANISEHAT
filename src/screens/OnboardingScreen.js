import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const FEATURES = [
  { icon: 'search', label: 'Identifikasi Tanaman', desc: 'Kenali jenis tanamanmu hanya dari foto daun' },
  { icon: 'leaf', label: 'Panduan Perawatan AI', desc: 'Dapatkan tips perawatan spesifik bertenaga AI' },
  { icon: 'library', label: 'Ensiklopedia Tani', desc: 'Artikel panduan bertani dari para ahli' },
];

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroCircle}>
            <Text style={styles.heroEmoji}>🌱</Text>
          </View>
          <Text style={styles.title}>Selamat Datang di</Text>
          <Text style={styles.appName}>TaniSehat</Text>
          <Text style={styles.subtitle}>
            Teman pintar untuk memahami dan merawat tanaman kesayanganmu
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Mulai Sekarang</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Menggunakan teknologi PlantNet & OpenRouter AI
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
  },
  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featuresSection: {
    gap: 16,
    paddingVertical: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 17,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 17,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
