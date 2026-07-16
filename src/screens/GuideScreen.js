import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ARTICLES } from '../data/articles';

const CATEGORIES = ['Semua', 'Penyiraman', 'Pemupukan', 'Hama & Penyakit', 'Media Tanam', 'Musiman', 'Perawatan'];

function ArticleCard({ article, onPress }) {
  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.articleEmoji, { backgroundColor: COLORS.primaryBg }]}>
        <Text style={{ fontSize: 30 }}>{article.emoji}</Text>
      </View>
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <Text style={styles.categoryTag}>{article.category}</Text>
          <View style={styles.readTimeRow}>
            <Ionicons name="time-outline" size={11} color={COLORS.textLight} />
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.articleSubtitle} numberOfLines={2}>{article.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.primaryLight} style={styles.articleChevron} />
    </TouchableOpacity>
  );
}

export default function GuideScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filtered = selectedCategory === 'Semua'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerEmoji}>
          <Text style={{ fontSize: 24 }}>📚</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Panduan Bertani</Text>
          <Text style={styles.headerSub}>Ensiklopedia perawatan tanaman</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles */}
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.articleList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => navigation.navigate('Article', { article: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada artikel untuk kategori ini.</Text>
          </View>
        }
      />
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
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerEmoji: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
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

  categoryScroll: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 52,
  },
  categoryContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },

  articleList: {
    padding: 16,
    gap: 12,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  articleEmoji: {
    width: 58,
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    flex: 1,
    gap: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 20,
  },
  articleSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  articleChevron: {
    marginLeft: 4,
  },

  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
