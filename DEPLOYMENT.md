# Panduan Deployment & Update AWS (Pinterest Clone)

Dokumen ini menjelaskan langkah-langkah detail untuk mengupdate dan men-deploy ulang backend (AWS Lambda via AWS SAM) dan frontend (AWS S3 & CloudFront) dari project Pinterest Clone ini.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum memulai, pastikan perangkat Anda sudah terinstal dan terkonfigurasi dengan tools berikut:

1. **AWS CLI** yang sudah dikonfigurasi dengan kredensial IAM Anda:
   ```bash
   aws configure
   ```
2. **AWS SAM CLI** untuk deployment backend serverless:
   ```bash
   sam --version
   ```
3. **Bun Runtime** untuk proses build backend dan frontend:
   ```bash
   bun --version
   ```

---

## 💾 1. Backend Deployment (AWS Lambda & API Gateway via SAM)

Backend dibangun menggunakan **ElysiaJS** dengan runtime **Bun** dan ORM **Prisma**. Deployment dikelola menggunakan **AWS SAM (Serverless Application Model)**.

### Langkah 1: Pindah ke Direktori Backend
```bash
cd apps/backend
```

### Langkah 2: Lakukan Build & Bundling
Jalankan script build khusus yang akan melakukan generate client Prisma, melakukan bundling ESModules menggunakan `esbuild`, menyalin modul Prisma, serta menghapus binary engine database yang tidak diperlukan (menyisakan engine RHEL Runtimes) agar ukuran package berkurang drastis dari **~60MB ke ~30MB**:
```bash
bun run build
```

### Langkah 3: Jalankan Migrasi Database (Jika Ada Perubahan Schema)
Jika Anda mengubah file `prisma/schema.prisma` dan ingin memperbarui tabel database di AWS RDS PostgreSQL, jalankan perintah berikut:
```bash
bunx prisma migrate deploy
```

### Langkah 4: Deploy Menggunakan AWS SAM
* **Untuk Update Pertama Kali (atau Perubahan Parameter Stack):**
  Jalankan perintah dengan parameter `--guided` agar Anda dapat menginput parameter lingkungan AWS seperti RDS connection string, JWT secret, Google OAuth, dll:
  ```bash
  sam deploy --guided
  ```
  Anda akan diminta memasukkan nilai parameter:
  - **DatabaseUrl**: String koneksi PostgreSQL AWS RDS Anda.
  - **JwtSecret**: Kunci rahasia unik untuk enkripsi token JWT.
  - **GoogleClientId** & **GoogleClientSecret**: Kredensial Google OAuth untuk login.
  - **FrontendUrl**: URL aplikasi frontend Anda di AWS S3/CloudFront.

* **Untuk Update Kode Selanjutnya (Hanya Update Logika Kode):**
  Setelah deployment guided pertama kali sukses, file konfigurasi deployment akan disimpan di `samconfig.toml`. Untuk pembaruan kode selanjutnya, Anda cukup menjalankan:
  ```bash
  sam deploy
  ```

*Setelah deployment sukses, simpan nilai **ApiUrl** dari bagian outputs AWS SAM untuk digunakan pada konfigurasi frontend.*

---

## 🌐 2. Frontend Deployment (AWS S3 & CloudFront)

Frontend dibangun dengan **React**, **Vite**, dan **TailwindCSS v4**, yang menghasilkan static files yang sangat ringan dan siap di-host di S3.

### Langkah 1: Pindah ke Direktori Frontend
```bash
cd apps/frontend
```

### Langkah 2: Konfigurasi Environment Production
Buka file `.env.production` dan pastikan konfigurasi API base URL menunjuk ke API Gateway/Lambda URL baru Anda (yang didapatkan dari Output **ApiUrl** SAM deploy):
```env
VITE_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/Prod
VITE_GOOGLE_CLIENT_ID=google-client-id-anda-di-sini
```

### Langkah 3: Build Asset Produksi
Jalankan proses kompilasi TypeScript dan pembuatan bundel static files terkompresi dengan Vite:
```bash
bun run build
```
Hasil build akan tersimpan di dalam folder `apps/frontend/dist/`.

### Langkah 4: Sinkronisasikan File ke AWS S3
Unggah folder `dist` ke bucket S3 yang digunakan untuk hosting static website. Ganti `<nama-s3-bucket-anda>` dengan nama bucket AWS Anda:
```bash
aws s3 sync dist/ s3://<nama-s3-bucket-anda> --delete
```
*(Flag `--delete` memastikan file lama yang sudah tidak digunakan di bucket S3 akan dihapus secara otomatis).*

### Langkah 5: Invalidate Cache CloudFront (Opsional tetapi Sangat Disarankan)
Jika Anda menggunakan **AWS CloudFront CDN** di depan bucket S3 Anda, browser pengguna mungkin masih menyimpan cache versi lama. Lakukan invalidasi cache agar perubahan langsung live secara global:
```bash
aws cloudfront create-invalidation --distribution-id <id-distribusi-cloudfront-anda> --paths "/*"
```

---

## 📌 Rangkuman Perintah Cepat (Cheatsheet)

### Update Backend:
```bash
cd apps/backend
bun run build
sam deploy
```

### Update Frontend:
```bash
cd apps/frontend
# Edit .env.production bila diperlukan
bun run build
aws s3 sync dist/ s3://<nama-s3-bucket-anda> --delete
aws cloudfront create-invalidation --distribution-id <id-distribusi-cloudfront-anda> --paths "/*"
```
