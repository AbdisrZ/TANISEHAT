import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      return <Text style={styles.blockHeading}>{block.text}</Text>;
    case 'paragraph':
      return <Text style={styles.blockParagraph}>{block.text}</Text>;
    case 'list':
      return (
        <View style={styles.blockList}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.listDot} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
}

export default function ArticleScreen({ route, navigation }) {
  const { article } = route.params || {};

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text>Artikel tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{article.category}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Article Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 48 }}>{article.emoji}</Text>
          </View>
          <View style={styles.heroMeta}>
            <Text style={styles.heroCategoryTag}>{article.category}</Text>
            <View style={styles.readTimeRow}>
              <Ionicons name="time-outline" size={13} color={COLORS.primaryPale} />
              <Text style={styles.readTimeText}>{article.readTime} baca</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <Text style={styles.heroSubtitle}>{article.subtitle}</Text>
        </View>

        {/* Content */}
        <View style={styles.contentWrap}>
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaText}>Ingin tahu lebih lanjut tentang tanamanmu?</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Scan')}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Scan & Identifikasi Tanaman</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },

  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCategoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryPale,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 12,
    color: COLORS.primaryPale,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },

  contentWrap: {
    backgroundColor: COLORS.white,
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  blockHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryBg,
    marginBottom: 4,
  },
  blockParagraph: {
    fontSize: 15,
    color: COLORS.textMedium,
    lineHeight: 24,
  },
  blockList: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  listDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
    marginTop: 7,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMedium,
    lineHeight: 22,
  },

  ctaCard: {
    margin: 20,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 18,
    padding: 20,
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryPale,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
