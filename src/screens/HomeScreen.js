import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TIPS, ARTICLES } from '../data/articles';
import { getHistory } from '../utils/storage';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ConfidenceBadge({ confidence }) {
  const pct = parseFloat(confidence);
  const color = pct >= 80 ? COLORS.success : pct >= 60 ? COLORS.warning : COLORS.danger;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{confidence}%</Text>
    </View>
  );
}

function TipCard({ item }) {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipEmoji}>{item.emoji}</Text>
      <Text style={styles.tipCategory}>{item.category}</Text>
      <Text style={styles.tipText}>{item.text}</Text>
    </View>
  );
}

function HistoryMiniCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.miniHistCard} onPress={onPress} activeOpacity={0.8}>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.miniHistImg} />
      ) : (
        <View style={[styles.miniHistImg, styles.miniHistImgPlaceholder]}>
          <Text style={{ fontSize: 22 }}>🌿</Text>
        </View>
      )}
      <View style={styles.miniHistInfo}>
        <Text style={styles.miniHistName} numberOfLines={1}>{item.plantName}</Text>
        <Text style={styles.miniHistSci} numberOfLines={1}>{item.scientificName}</Text>
        <View style={styles.miniHistBottom}>
          <ConfidenceBadge confidence={item.confidence} />
          <Text style={styles.miniHistDate}>
            {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [recentHistory, setRecentHistory] = useState([]);
  const todayTip = TIPS[new Date().getDate() % TIPS.length];

  useFocusEffect(
    useCallback(() => {
      getHistory().then((h) => setRecentHistory(h.slice(0, 3)));
    }, [])
  );

  const quickGuides = ARTICLES.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Petani! 👋</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 22 }}>🧑‍🌾</Text>
          </View>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity
          style={styles.scanCta}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.88}
        >
          <View style={styles.scanCtaLeft}>
            <Text style={styles.scanCtaTitle}>Identifikasi Tanaman</Text>
            <Text style={styles.scanCtaDesc}>Foto daun → kenali jenis & dapatkan panduan perawatan</Text>
          </View>
          <View style={styles.scanCtaIcon}>
            <Ionicons name="camera" size={30} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Tip Hari Ini */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleStandalone}>Tip Hari Ini</Text>
          <View style={styles.tipOfDay}>
            <Text style={styles.tipOfDayEmoji}>{todayTip.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipOfDayCategory}>{todayTip.category}</Text>
              <Text style={styles.tipOfDayText}>{todayTip.text}</Text>
            </View>
          </View>
        </View>

        {/* Tips Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleStandalone}>Tips Perawatan</Text>
          <FlatList
            data={TIPS}
            keyExtractor={(t) => t.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <TipCard item={item} />}
          />
        </View>

        {/* Riwayat Terakhir */}
        {recentHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scan Terakhir</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
                <Text style={styles.seeAll}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.historyList}>
              {recentHistory.map((item) => (
                <HistoryMiniCard
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('ScanDetail', { item })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Panduan Cepat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Panduan Bertani</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GuideTab')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.guideGrid}>
            {quickGuides.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.guideCard}
                onPress={() => navigation.navigate('Article', { article: a })}
                activeOpacity={0.8}
              >
                <Text style={styles.guideEmoji}>{a.emoji}</Text>
                <Text style={styles.guideTitle} numberOfLines={2}>{a.title}</Text>
                <Text style={styles.guideCategory}>{a.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 3,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanCta: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.primaryMedium,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scanCtaLeft: { flex: 1, marginRight: 16 },
  scanCtaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  scanCtaDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 17,
  },
  scanCtaIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionTitleStandalone: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },

  tipOfDay: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryLight,
  },
  tipOfDayEmoji: { fontSize: 28, marginTop: 2 },
  tipOfDayCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tipOfDayText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },

  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    width: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  tipEmoji: { fontSize: 26, marginBottom: 6 },
  tipCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 17,
  },

  historyList: { paddingHorizontal: 20, gap: 10 },
  miniHistCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  miniHistImg: {
    width: 72,
    height: 72,
  },
  miniHistImgPlaceholder: {
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniHistInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  miniHistName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  miniHistSci: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  miniHistBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniHistDate: {
    fontSize: 11,
    color: COLORS.gray500,
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

  guideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  guideCard: {
    width: '46%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  guideEmoji: { fontSize: 28, marginBottom: 6 },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 4,
  },
  guideCategory: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
