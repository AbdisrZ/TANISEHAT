# 🌿 TaniSehat

**TaniSehat** adalah aplikasi mobile berbasis React Native (Expo) untuk identifikasi tanaman dan panduan perawatannya. Cukup foto daun tanaman, aplikasi akan mengenali jenis tanamannya lalu menyusun panduan perawatan lengkap — penyiraman, pencahayaan, pemupukan, hingga penanganan hama & penyakit — dalam bahasa Indonesia yang mudah dipahami.

## ✨ Fitur

- 📸 **Scan Tanaman** — identifikasi tanaman dari foto daun menggunakan [PlantNet API](https://my.plantnet.org), lengkap dengan nama ilmiah, genus, famili, dan tingkat akurasi.
- 🌱 **Panduan Perawatan Cerdas** — rekomendasi perawatan yang disusun otomatis dan disesuaikan dengan jenis tanaman yang teridentifikasi.
- 🕘 **Riwayat Scan** — hasil identifikasi tersimpan dan dapat dibuka kembali kapan saja.
- 🪴 **Tanaman Saya** — kelola koleksi tanaman pribadi beserta jadwal perawatannya.
- 📖 **Panduan & Artikel** — kumpulan artikel dan tips seputar perawatan tanaman.
- 🔔 **Notifikasi** — pengingat perawatan tanaman.

## 🛠️ Teknologi

| Komponen | Teknologi |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 / React Native 0.81 |
| Navigasi | React Navigation (native stack + bottom tabs) |
| Identifikasi tanaman | PlantNet API |
| Rekomendasi perawatan | LLM (melalui endpoint chat completions) |
| Penyimpanan lokal | AsyncStorage |
| Build | EAS Build |

## 🚀 Menjalankan Proyek

### Prasyarat

- Node.js LTS dan npm
- Aplikasi [Expo Go](https://expo.dev/go) di perangkat Android/iOS, atau emulator

### Instalasi

1. Clone repositori:

   ```bash
   git clone https://github.com/AbdisrZ/TANISEHAT.git
   cd TANISEHAT
   ```

2. Install dependensi:

   ```bash
   npm install
   ```

3. Siapkan variabel lingkungan:

   ```bash
   cp .env.example .env
   ```

   Lalu isi `.env` dengan kredensial Anda:

   | Variabel | Keterangan |
   |---|---|
   | `EXPO_PUBLIC_PLANTNET_API_KEY` | API key PlantNet (daftar gratis di [my.plantnet.org](https://my.plantnet.org)) |
   | `EXPO_PUBLIC_OPENROUTER_API_KEY` | API key penyedia LLM |
   | `EXPO_PUBLIC_AI_MODEL` | ID model LLM yang digunakan |

4. Jalankan aplikasi:

   ```bash
   npx expo start
   ```

   Pindai QR code dengan Expo Go, atau tekan `a` untuk membuka di emulator Android.

## 📦 Build APK

Proyek ini menggunakan [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform android --profile preview
```

## 📁 Struktur Proyek

```
tanisehat/
├── App.js                 # Entry point & konfigurasi navigasi
├── src/
│   ├── constants/         # Warna & konstanta tema
│   ├── data/              # Data statis (artikel, panduan)
│   ├── screens/           # Seluruh layar aplikasi
│   └── utils/             # Helper (storage, notifikasi, dll.)
├── assets/                # Ikon, splash screen, gambar
├── app.json               # Konfigurasi Expo
└── eas.json               # Konfigurasi EAS Build
```

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan Tugas Akhir. Seluruh hak cipta dilindungi.

---

Dikembangkan oleh **AbdisrZ**
