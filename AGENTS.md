# AGENTS.md — Protocol, Guidelines & User Preferences

Panduan ini wajib dipatuhi oleh setiap AI coding assistant / agent yang bekerja di repositori **SpeedBench**.

---

## 1. Aturan Emas: Integritas File & Tindakan Destruktif

1. **JANGAN PERNAH MENGHAPUS FILE TANPA IZIN:**
   - Dilarang keras menjalankan perintah penghapusan file (`rm`, `del`, `fs.unlink`, `fs.rmSync`, `git clean`) terhadap file apapun di workspace, terutama file yang berada di root atau folder proyek.
   - Jika melihat file baru/untracked di `git status` (misal: `?? favicon.svg`), **JANGAN PERNAH** mengasumsikannya sebagai file sampah, duplikat, atau artefak yang salah dibuat. Itu adalah file yang ditaruh langsung oleh pengguna.
   - Jika pengguna mengatakan *"tambahkan X"*, periksa terlebih dahulu apakah file `X` sudah disediakan oleh pengguna di workspace (`read` / `glob`), baca isinya, dan gunakan file tersebut. Jangan membuat file baru buatan sendiri yang menimpa atau memicu penghapusan file pengguna.

2. **DILARANG MENGUBAH / MERUSAK ASET ASLI:**
   - Aset font biner (`.woff`, `.woff2`), stylesheet, gambar, dan ikon tidak boleh diubah atau dipotong nama berkasnya secara sembarangan.
   - Jika memindahkan file aset ke subfolder (seperti `assets/fonts/`), pastikan pemetaan URL di CSS tetap merujuk ke nama file fisik yang persis sama.

---

## 2. Pola Interaksi & Komunikasi dengan Pengguna

1. **Transparan & Jangan Menyelesaikan Masalah Sendirian Diam-Diam:**
   - *Prinsip utama:* *"Kalau ada masalah bilang, jangan fix sendirian. Misal harus login ulang, ya bilang ke aku."*
   - Jika menemukan masalah yang butuh interaksi manusia (seperti autentikasi `wrangler login`, OAuth browser, kredensial API, atau error sistem di luar kendali AI), **langsung laporkan dengan jelas**.
   - Berikan perintah spesifik yang perlu dijalankan pengguna di terminal interaktifnya (CMD / PowerShell).

2. **Jujur, Tanggung Jawab, dan Jangan Mengelak:**
   - Jika melakukan kesalahan atau ada hal yang terlewat, akui secara terbuka, jelaskan apa yang terjadi secara teknis, dan fokus langsung pada solusi pemulihan tanpa mencari alasan atau alibi berbelit-belit.

3. **Gaya Bahasa & Nada Bicara:**
   - Pengguna berinteraksi santai dalam bahasa Indonesia, kadang menyertakan spesifikasi teknis dalam bahasa Inggris.
   - Jawab secara teknis, langsung ke inti permasalahan (*terse, evidence-first*), tanpa basa-basi pemasaran atau penjelasan berlebih yang tidak diminta.

---

## 3. Standar Arsitektur & Rekayasa Kode

1. **Modular di Lokal (< 500 Baris per File):**
   - File kode sumber JavaScript/JSX di dalam `src/` tidak boleh menjadi file raksasa (monolith mentah).
   - Setiap file harus dipecah berdasarkan fungsionalitas tunggal (komponen UI, hooks, kalkulator bitwise, API geolokasi) dengan panjang ideal di bawah 250 baris (maksimal mutlak 500 baris).

2. **Monolith saat Produksi (Single Bundle):**
   - Meskipun di lokal dipecah menjadi banyak modul, saat di-build untuk pengguna (`npm run build`), bundler Vite wajib menggabungkannya menjadi **1 berkas JavaScript monolith tunggal** (`dist/assets/app.js`) tanpa *code-splitting* yang terpecah-pecah.

3. **Prinsip Offline-First & Privasi:**
   - Seluruh logika kalkulasi jaringan (IPv4 math, subnetting, CIDR, netmask, host membership) wajib dieksekusi 100% di browser pengguna secara offline menggunakan operasi bitwise JavaScript.
   - Hanya fitur pelacak geolokasi publik (tool `Locate`) dan widget IP yang boleh melakukan network fetch ke API publik. Jangan menambahkan telemetri, tracker, atau request latar belakang yang tidak perlu.

4. **Atribusi & Rebranding:**
   - Proyek ini adalah versi modular & modern dari karya orisinal `netbench.pages.dev`.
   - Atribusi terhadap `netbench.pages.dev` wajib selalu dijaga (di halaman `?tool=about` dan `README.md`).
   - Identitas branding proyek ini adalah **SpeedBench**.

---

## 4. Alur Kerja Build & Deployment (Cloudflare Pages)

- **Development Lokal:**
  ```bash
  npm run dev
  ```
- **Build Produksi:**
  ```bash
  npm run build
  ```
- **Simulasi Cloudflare Pages Lokal:**
  ```bash
  npm run pages:dev
  ```
- **Deploy ke Cloudflare Pages:**
  ```bash
  npm run deploy
  # atau:
  npx wrangler pages deploy dist --project-name=speedbench --commit-dirty=true
  ```
- **Verifikasi Nyata:**
  - Setiap selesai melakukan deploy atau perubahan fungsi penting, uji langsung halaman live produksi menggunakan headless browser atau evaluasi riil. Jangan menyatakan selesai tanpa bukti verifikasi.
