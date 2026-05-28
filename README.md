# 📌 Pinterest Clone - Team 5

Sebuah replika (clone) dari platform media sosial visual **Pinterest**. Proyek ini dikembangkan untuk mereplikasi fitur-fitur inti dari Pinterest, mulai dari autentikasi pengguna, eksplorasi *home feed*, unggah gambar (*pinning*), hingga interaksi antar pengguna melalui komentar, balasan, dan notifikasi.

## 🚀 Fitur Utama

- **Authentication & User Profile**: Sistem registrasi, login, dan manajemen profil pengguna.
- **Home Feed**: Tampilan galeri *masonry* dinamis untuk mengeksplorasi konten visual.
- **Post & Upload Image**: Fitur untuk mengunggah gambar dan membuat "Pin" baru.
- **Comment & Reply**: Sistem diskusi interaktif pada setiap postingan.
- **Notification & Likes**: Sistem notifikasi *real-time* dan fitur *like* (menyukai postingan).

## 🛠️ Tech Stack

### 🎨 Frontend (Client Side)
| Kategori | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Core** | `React 19` & `TypeScript` | Kerangka UI interaktif & pengetikan data aman |
| **Build Tool** | `Vite 8` | Proses compile & reload lokal super cepat |
| **Routing** | `React Router DOM 7` | Navigasi halaman dinamis tanpa loading ulang |
| **State** | `Zustand 5` | Manajemen sesi login & data user global |
| **Data Fetching** | `React Query v5` | Sinkronisasi data & auto-caching API |
| **Styling & UI** | `Tailwind CSS v4` & `Vanilla CSS` | Desain grid responsif & kustomisasi layout premium |
| **Notifikasi** | `React Hot Toast` & `Lucide Icons` | Popup info aksi & set ikon modern |

### ⚙️ Backend (Server API)
| Kategori | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Runtime** | `Bun 1.3` | Eksekusi kode JS/TS berkinerja tinggi |
| **Framework** | `Elysia` | Framework API super ringan & cepat khas Bun |
| **Database ORM** | `Prisma v6` | Penghubung aman antara backend & PostgreSQL |
| **Keamanan** | `bcryptjs` & `JWT` | Hashing password & token keamanan login |
| **Bundler** | `esbuild` | Menyatukan kode API ke satu file untuk Cloud |

### 🗄️ Database, Media, & Cloud (AWS Serverless)
* **Database**: `PostgreSQL` — Penyimpanan utama data relasional.
* **Media Storage**: `Cloudinary` — CDN khusus untuk penyimpanan & optimasi ukuran gambar via Direct Upload dari browser.
* **AWS Lambda**: Serverless hosting backend API (skalabilitas otomatis tanpa server fisik).
* **AWS S3 & CloudFront**: Hosting statis frontend berkecepatan tinggi dengan enkripsi HTTPS.
* **AWS SAM**: Alat otomasi konfigurasi infrastruktur cloud (`template.yaml`).


## 👥 Pembagian Tugas (Team 5)

Proyek ini dikembangkan secara kolaboratif dengan pembagian fokus sebagai berikut:

| Anggota | Fokus Pengembangan |
| :--- | :--- |
| **Atha** | Auth, Profile, Integrasi Project, Deployment |
| **Bila** | Home Feed |
| **Chris** | Post & Upload Image |
| **Evelyn** | Comment & Reply |
| **Shalwa** | Notification & Like |
| **Naomy** | Testing & Dokumentasi |

## 📁 Link Dokumen
Berikut adalah tautan dokumen terkait pengembangan proyek ini:
**Google Docs**: [Link Dokumentasi Google Docs](https://docs.google.com/document/d/1bbeGj649kB4TlVtWBhqFZHt-Nfvc7Ev30XBNnAMqTaU/edit?usp=sharing)
