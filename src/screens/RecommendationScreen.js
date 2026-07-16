import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL;

function buildPrompt(plantName, scientificName) {
  return `Kamu adalah ahli botani dan pertanian Indonesia yang berpengalaman.

Tanaman yang teridentifikasi: **${plantName}** (${scientificName})

Berikan panduan perawatan lengkap dan praktis dalam bahasa Indonesia. Gunakan format berikut persis:

**PENYIRAMAN 💧**
[Frekuensi dan cara menyiram tanaman ini yang tepat]

**PENCAHAYAAN ☀️**
[Kebutuhan cahaya matahari dan posisi ideal]

**PEMUPUKAN 🌱**
[Jenis pupuk dan jadwal pemupukan yang disarankan]

**HAMA & PENYAKIT 🐛**
[Hama dan penyakit yang sering menyerang, serta cara mengatasinya]

**TIPS KHUSUS ✨**
[2-3 tips perawatan unik atau penting untuk tanaman ini]

Tulis dalam bahasa Indonesia yang mudah dipahami petani dan pecinta tanaman awam. Singkat dan praktis.`;
}

function parseSection(text, heading, nextHeadings) {
  const start = text.indexOf(heading);
  if (start === -1) return null;
  let end = text.length;
  for (const next of nextHeadings) {
    const idx = text.indexOf(next, start + heading.length);
    if (idx !== -1 && idx < end) end = idx;
  }
  return text
    .slice(start + heading.length, end)
    .replace(/^\s*\n/, "")
    .trim();
}

const SECTIONS = [
  {
    key: "PENYIRAMAN",
    heading: "**PENYIRAMAN 💧**",
    icon: "water",
    color: "#2196F3",
    label: "Penyiraman",
  },
  {
    key: "PENCAHAYAAN",
    heading: "**PENCAHAYAAN ☀️**",
    icon: "sunny",
    color: "#FF9800",
    label: "Pencahayaan",
  },
  {
    key: "PEMUPUKAN",
    heading: "**PEMUPUKAN 🌱**",
    icon: "leaf",
    color: COLORS.primary,
    label: "Pemupukan",
  },
  {
    key: "HAMA",
    heading: "**HAMA & PENYAKIT 🐛**",
    icon: "bug",
    color: "#F44336",
    label: "Hama & Penyakit",
  },
  {
    key: "TIPS",
    heading: "**TIPS KHUSUS ✨**",
    icon: "sparkles",
    color: "#9C27B0",
    label: "Tips Khusus",
  },
];

// Parse inline: **bold**, *italic*
function renderInline(text, baseStyle, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  if (parts.length === 1) return <Text key={key} style={baseStyle}>{text}</Text>;
  return (
    <Text key={key} style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <Text key={i} style={{ fontWeight: "700" }}>{part.slice(2, -2)}</Text>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <Text key={i} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</Text>;
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

// Cek apakah baris adalah separator tabel (|---|---|)
function isTableSeparator(line) {
  return /^\|[\s\-:|]+\|/.test(line.trim());
}

// Parse dan render tabel markdown
function MarkdownTable({ rows }) {
  const header = rows[0];
  const body = rows.slice(2); // skip separator row
  return (
    <View style={tableStyles.table}>
      {/* Header */}
      <View style={[tableStyles.row, tableStyles.headerRow]}>
        {header.map((cell, i) => (
          <View key={i} style={tableStyles.cell}>
            <Text style={tableStyles.headerCell}>{cell.trim()}</Text>
          </View>
        ))}
      </View>
      {/* Body */}
      {body.map((row, ri) => (
        <View key={ri} style={[tableStyles.row, ri % 2 === 1 && tableStyles.altRow]}>
          {row.map((cell, ci) => (
            <View key={ci} style={tableStyles.cell}>
              {renderInline(cell.trim(), tableStyles.bodyCell, ci)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const tableStyles = StyleSheet.create({
  table: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
  },
  headerRow: {
    backgroundColor: COLORS.primaryBg,
  },
  altRow: {
    backgroundColor: COLORS.gray100,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  bodyCell: {
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 18,
  },
});

// Render markdown menjadi komponen React Native
// Support: **bold**, *italic*, tabel, bullet list (- item), baris biasa
function RichText({ text, style }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Deteksi tabel: baris ini adalah header tabel jika baris berikutnya adalah separator
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "") // hapus | di awal dan akhir
          .split("|");
        tableRows.push(cells);
        i++;
      }
      if (tableRows.length >= 2) {
        elements.push(<MarkdownTable key={`table-${i}`} rows={tableRows} />);
      }
      continue;
    }

    // Bullet list: - item atau • item
    if (/^[-•]\s+/.test(trimmed)) {
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginVertical: 2, paddingLeft: 4 }}>
          <Text style={[style, { marginRight: 6, lineHeight: 20 }]}>•</Text>
          {renderInline(trimmed.replace(/^[-•]\s+/, ""), style, `bullet-${i}`)}
        </View>
      );
      i++;
      continue;
    }

    // Baris kosong — skip
    if (trimmed === "") {
      elements.push(<View key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // Baris biasa dengan inline formatting
    elements.push(renderInline(trimmed, style, `line-${i}`));
    elements.push(<View key={`sp-${i}`} style={{ height: 2 }} />);
    i++;
  }

  return <View>{elements}</View>;
}


function SectionCard({ section, content }) {
  const [expanded, setExpanded] = useState(true);
  if (!content) return null;
  return (
    <TouchableOpacity
      style={[styles.sectionCard, { borderLeftColor: section.color }]}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.9}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            { backgroundColor: section.color + "18" },
          ]}
        >
          <Ionicons name={section.icon} size={18} color={section.color} />
        </View>
        <Text style={[styles.sectionLabel, { color: section.color }]}>
          {section.label}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={COLORS.gray500}
        />
      </View>
      {expanded && <RichText text={content} style={styles.sectionContent} />}
    </TouchableOpacity>
  );
}

export default function RecommendationScreen({ route, navigation }) {
  const { plantName = "Tanaman", scientificName = "" } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setRawResponse("");

    const fetchRecommendation = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik timeout
      try {
        const response = await fetch(
          "https://openagentic.id/api/v1/chat/completions",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://tanisehat.app",
              "X-Title": "TaniSehat",
            },
            body: JSON.stringify({
              model: AI_MODEL,
              stream: false,
              messages: [
                {
                  role: "user",
                  content: buildPrompt(plantName, scientificName),
                },
              ],
            }),
          },
        );
        clearTimeout(timeoutId);

        // Server kadang mengembalikan SSE mixed dengan JSON
        // ambil text dulu, lalu parse secara manual
        const rawText = await response.text();
        if (cancelled) return;

        let data = null;
        try {
          // Coba parse langsung sebagai pure JSON
          data = JSON.parse(rawText);
        } catch {
          // Jika gagal (SSE format), cari baris "data: {...}" yang bukan "[DONE]"
          const lines = rawText.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
              try {
                data = JSON.parse(trimmed.slice(6));
                if (data?.choices?.[0]?.message?.content) break;
              } catch {
                // lanjut ke baris berikutnya
              }
            }
          }
        }

        if (data?.choices?.[0]?.message?.content) {
          setRawResponse(data.choices[0].message.content);
        } else {
          setError(
            data?.error?.message || "AI tidak memberikan respons. Coba lagi.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[RecommendationScreen] fetch error:", err?.message, err);
          setError(`Gagal terhubung ke server AI. Periksa koneksi internetmu.\n\n(${err?.message || 'Unknown error'})`);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRecommendation();
    return () => {
      cancelled = true;
    };
  }, [plantName, scientificName, retryCount]);

  const parsedSections = {};
  if (rawResponse) {
    const headings = SECTIONS.map((s) => s.heading);
    SECTIONS.forEach((s, i) => {
      parsedSections[s.key] = parseSection(
        rawResponse,
        s.heading,
        headings.slice(i + 1),
      );
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Panduan Perawatan</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {plantName}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Plant info */}
        <View style={styles.plantBanner}>
          <View style={styles.plantBannerIcon}>
            <Text style={{ fontSize: 32 }}>🌿</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantBannerName}>{plantName}</Text>
            {scientificName ? (
              <Text style={styles.plantBannerSci}>{scientificName}</Text>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryLight} />
            <Text style={styles.loadingTitle}>
              AI sedang menyiapkan panduan...
            </Text>
            <Text style={styles.loadingSubtitle}>
              Menganalisis kebutuhan {plantName} 🌱
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={COLORS.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setRetryCount((c) => c + 1)}
            >
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionsContainer}>
            {SECTIONS.map((s) => (
              <SectionCard
                key={s.key}
                section={s}
                content={parsedSections[s.key]}
              />
            ))}
            {!Object.values(parsedSections).some(Boolean) && (
              <View style={styles.rawCard}>
                <Text style={styles.rawText}>{rawResponse}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primaryPale,
    fontStyle: "italic",
    marginTop: 1,
  },

  plantBanner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  plantBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
  },
  plantBannerName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  plantBannerSci: {
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.textLight,
    marginTop: 2,
  },

  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
  },

  errorContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  sectionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 22,
  },

  rawCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  rawText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 22,
  },
});
