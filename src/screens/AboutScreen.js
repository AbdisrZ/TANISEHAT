import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const TEAM = [
  {
    name: 'Nurulaisya',
    role: 'Mobile Developer',
    emoji: '👩‍💻',
  },
  {
    name: 'Abdisr',
    role: 'Mobile Developer',
    emoji: '👨‍💻',
  },
];

const TECH = [
  { icon: 'phone-portrait-outline', label: 'React Native & Expo Go', desc: 'Framework pengembangan aplikasi mobile' },
  { icon: 'leaf-outline', label: 'PlantNet API', desc: 'Identifikasi jenis tanaman dari foto daun' },
  { icon: 'sparkles-outline', label: 'OpenRouter AI', desc: 'Panduan perawatan tanaman bertenaga AI' },
  { icon: 'server-outline', label: 'AsyncStorage', desc: 'Penyimpanan riwayat scan secara lokal' },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLogo}>
            <Text style={{ fontSize: 52 }}>🌿</Text>
          </View>
          <Text style={styles.heroAppName}>TaniSehat</Text>
          <Text style={styles.heroVersion}>Versi 1.0.0</Text>
          <Text style={styles.heroTagline}>Asisten Cerdas Perawatan Tanaman</Text>
        </View>

        {/* Info Akademik */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Informasi Akademik</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Aplikasi ini dibuat untuk menyelesaikan{' '}
              <Text style={styles.infoBold}>Tugas Akhir Pemrograman Mobile</Text>
            </Text>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={15} color={COLORS.primaryLight} />
              <Text style={styles.infoLabel}>Universitas Dian Nusantara</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={15} color={COLORS.primaryLight} />
              <Text style={styles.infoLabel}>
                Dosen Pengampu:{' '}
                <Text style={styles.infoBold}>Bpk. Sahrial Ishak, S.Kom., M.Kom.</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Tim Pembuat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tim Pembuat</Text>
          </View>
          <View style={styles.teamRow}>
            {TEAM.map((member, i) => (
              <View key={i} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={{ fontSize: 32 }}>{member.emoji}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Teknologi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Teknologi yang Digunakan</Text>
          </View>
          <View style={styles.techList}>
            {TECH.map((t, i) => (
              <View key={i} style={styles.techItem}>
                <View style={styles.techIcon}>
                  <Ionicons name={t.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.techText}>
                  <Text style={styles.techLabel}>{t.label}</Text>
                  <Text style={styles.techDesc}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 TaniSehat — Universitas Dian Nusantara</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  hero: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 40,
    gap: 6,
  },
  heroLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroAppName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  heroVersion: {
    fontSize: 13,
    color: COLORS.primaryPale,
    fontWeight: '500',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMedium,
    flex: 1,
    lineHeight: 20,
  },

  teamRow: {
    flexDirection: 'row',
    gap: 12,
  },
  memberCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  techList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  techIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  techText: { flex: 1 },
  techLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  techDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },

  footer: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
