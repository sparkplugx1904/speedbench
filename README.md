# SpeedBench

> IPv4 toolkit yang berjalan 100% offline di browser, ditambah instrument benchmark
> kualitas internet berdurasi panjang.

[![React](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Bundle](https://img.shields.io/badge/Bundle-1%20app.js-3c873a)](#)
[![Host](https://img.shields.io/badge/Host-Cloudflare%20Pages-f48120?logo=cloudflare&logoColor=white)](https://pages.dev)
[![License](https://img.shields.io/badge/License-unspecified-lightgrey)](#credits--attribution)

**Live app:** [speedbench.pages.dev](https://speedbench.pages.dev) · [Benchmark tool](https://speedbench.pages.dev/?tool=benchmark) · [About](https://speedbench.pages.dev/?tool=about)

---

## Fitur

| Tool           | Fungsi                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| **Benchmark**  | Uji kualitas internet berdurasi panjang: throughput, loaded ping, jitter, probe loss |
| **Subnet**     | Network, broadcast, host range, dan wildcard dari IP + mask                          |
| **Membership** | Cek apakah sebuah IP berada dalam CIDR tertentu                                      |
| **Masks**      | Konversi prefix ⇄ dotted mask, atau hitung prefix dari jumlah host                   |
| **IP info**    | Klasifikasi alamat: kind/class, binary, integer, hex                                 |
| **Split**      | Pecah parent CIDR menjadi child subnets yang sama besar                              |
| **Locate**     | Lihat IP publik di peta (Leaflet + CARTO), lookup via API geo gratis                 |
| **About**      | Kredits, arsitektur, dan catatan privasi                                             |

Seluruh kalkulasi IPv4 dieksekusi **lokal via operasi bitwise JavaScript** — tetap
berfungsi tanpa koneksi internet. Hanya _Locate_ (API geolokasi publik) dan
_Benchmark_ (endpoint speed test publik) yang melakukan network fetch.

## Benchmark (`?tool=benchmark`)

Instrument pengukuran berdurasi panjang untuk menguji apakah kecepatan **bertahan
stabil** atau **drop** setelah burst awal:

- **Sampling 1 Hz** — 4 stream download paralel + probe HTTP.
- **4 metrik** — Download (Mbps), Loaded Ping (ms), Jitter (ms), Probe Loss (%)
  pada 1 chart interaktif dengan tab, time window 1 menit s.d. _All_, dan
  hover/tap inspector sambung-menyambung antar metrik.
- **Burst vs sustained** — rata-rata 10 detik pertama vs median bagian belakang
  sesi, plus deteksi otomatis _step-down_.
- **Mode Continuous / Interval** — interval: 10 detik mengukur, 20 detik berhenti.
- **Data cap** — menghitung byte nyata, otomatis berhenti saat limit tercapai.
- **Kontrol sesi** — start/pause/stop/reset, wake lock saat pengukuran, dan
  pemulihan sesi terakhir dari `localStorage`.
- **Ekspor** — CSV dan JSON siap dibangun.

Catatan & limitasi benchmark:

- **Download-only.** Upload diukur secara tidak langsung via probe, bukan turnarun transfer upload penuh.
- **Probe loss ≠ ICMP.** Browser tidak mengizinkan raw socket ICMP; lost dihitung dari timeout probe HTTP kecil (> 2 s).
- **Hasil = end-to-end browser.** Dampak Wi-Fi, NIC, dan perangkat ikut terukur; kabel Ethernet paling akurat.
- **Tab harus tetap terbuka.** Browser men-throttle timer request di tab latar belakang.
- **Konsumsi data** pada 50 Mbps continuous ≈ 22 GB/jam — atur cap atau pakai mode interval.
- Endpoint default: `speed.cloudflare.com/__down` (fallback endpoint self-hosted tersedia lewat Pages Functions).

## Arsitektur

- **Local modular.** Kode sumber dipisah per fungsi (ideal **< 250 baris/file**):
  matematika IP bitwise, engine benchmark, UI komponen terisolasi, stylesheet ter-scope.
- **Production monolith.** Vite menggabungkan semuanya menjadi **1 berkas
  JavaScript** (`dist/assets/app.js`) — tanpa code-splitting di produksi.
- **Scoped stylesheets.** `benchmark.css` dan `tools.css` adalah stylesheet semantik
  ter-scope (`bench-*`, `toolkit-*`) supaya desain tool tidak bergantung pada
  utility pra-kompilasi `public/assets/style.css` milik desain dasar.

## Struktur Berkas

```text
speedbench/
├── index.html                     # Entry: theme bootstrap + stylesheet dasar
├── vite.config.js
├── wrangler.toml
├── public/
│   └── assets/
│       ├── style.css              # Stylesheet dasar (pra-kompilasi, dirujuk langsung)
│       └── fonts/                 # Sora + JetBrains Mono (woff/woff2 lokal)
├── src/
│   ├── main.jsx                   # Mount React 19
│   ├── App.jsx                    # Layout, nav 8 tool, ToolHeader per halaman
│   ├── styles/
│   │   ├── benchmark.css          # Scope bench-* (instrument benchmark)
│   │   └── tools.css              # Scope toolkit-* (card, table, datalist, tabs)
│   ├── components/
│   │   ├── ui/                    # Card, Button, Input, DataList, ToolHeader, ResultBox
│   │   ├── MyIpWidget.jsx         # Deteksi & chip IP publik di sidebar
│   │   ├── ThemeContext.jsx / ThemeToggle.jsx
│   │   └── tools/
│   │       ├── SubnetCalculator / MembershipTool / MasksTool
│   │       ├── IpInfoTool / SplitTool / LocateTool / LeafletMap
│   │       ├── AboutTool
│   │       ├── BenchmarkTool.jsx  # Orchestrator sesi benchmark
│   │       └── benchmark/         # SessionBar, ReadoutsGrid, charts, export, setup…
│   ├── hooks/
│   │   └── useMyIp.js             # Deteksi IP publik (multi-provider)
│   └── utils/
│       ├── ip-math.js             # Bitwise IPv4: CIDR, wildcard, binary, split
│       ├── geo-api.js             # Lookup geolokasi multi-provider
│       ├── benchmark-config.js    # Endpoint & tuning engine
│       └── benchmark-*.js         # engine, analysis, snapshot, storage, export, format, view, chart-render
└── functions/
    ├── api/info.js                # Pages Function: info build
    └── speed/__down.js, __up.js   # Endpoint speed test self-hosted
```

## Perintah

| Perintah            | Kegunaan                                                     |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Dev server lokal (modular, HMR)                              |
| `npm run build`     | Build produksi → single bundle di `dist/`                    |
| `npm run preview`   | Sajikan hasil build lokal                                    |
| `npm run pages:dev` | Simulasi Cloudflare Pages + Functions lokal                  |
| `npm run deploy`    | Build lalu deploy ke Cloudflare Pages (`speedbench` project) |

## Privasi

- Kalkulasi jaringan: **offline, di browser**.
- Tanpa telemetry, analytics, tracker, atau request latar belakang.
- Sesi benchmark hanya tersimpan di `localStorage` perangkat sendiri.
- Andalkan endpoint publik hanya pada dua tool: **Locate** dan **Benchmark**.

## Credits & Attribution

Proyek ini dikembangkan berbasis dari karya orisinal
**[Netbench](https://netbench.pages.dev)**. Logika awal kalkulasi IPv4, konsep
antarmuka kalkulator offline, dan ide dasar diatribusikan dengan penuh apresiasi
kepada pembuat asli Netbench. SpeedBench hadir sebagai versi modular modern dengan
tool benchmark bawaan.
