# Phase 9 — Deploy to Production

> Part of the [Master Plan](./master-plan.md)

---

## Tujuan

Mendeploy semua perubahan dari environment **development** ke **production** secara aman, memastikan data production yang sudah ada tidak hilang, dan seluruh fitur dari Phase 1–8 berjalan dengan benar di production.

---

## Prasyarat

Sebelum memulai, pastikan hal-hal berikut sudah terpenuhi:

- [x] Firebase CLI sudah terinstall: `npm install -g firebase-tools`
- [x] Sudah login ke Firebase CLI: `firebase login`
- [x] File `.env.production` sudah terisi dengan konfigurasi Firebase project production
- [x] Akses ke Firebase Console untuk project production
- [x] `firebase-admin` SDK credentials tersedia (service account JSON) untuk proses backup
- [x] `node` versi 18+ terinstall
- [ ] Akun Vercel sudah ada dan repository (GitHub/GitLab) sudah terhubung ke Vercel
- [ ] Environment variables production sudah dikonfigurasi di Vercel dashboard

---

## Ringkasan Langkah

| Step | Aksi | Target | Risiko |
|---|---|---|---|
| 1 | Backup data production ke JSON | Lokal | — |
| 2 | Verifikasi backup | Lokal | — |
| 3 | Build aplikasi React untuk production | Lokal | — |
| 4 | Deploy Firestore Indexes | Firebase | ⚠️ Perlu waktu build |
| 5 | Deploy aplikasi React ke Vercel | Vercel | — |
| 6 | Verifikasi production | — | — |
| 7 | Rollback plan (jika diperlukan) | — | — |

> **Catatan:** Deploy Firestore Security Rules dilakukan secara terpisah di [Phase 10](./phase-10-deploy-security-rules.md) setelah production stabil.

---

## Step 1 — Backup Data Production ke JSON

> **Tujuan:** Menyimpan seluruh data Firestore production ke file JSON lokal sebelum ada perubahan apapun.

### 1.1 Buat script backup menggunakan Firebase Admin SDK

Buat file `scripts/backup-production.ts` yang akan mengekspor seluruh koleksi:

- `users` — semua user (superadmin, admin, supervisor)
- `merchants` — semua merchant beserta subcollection:
  - `merchants/{id}/products`
  - `merchants/{id}/sales`
  - `merchants/{id}/cashiers`
  - `merchants/{id}/expenses`

### 1.2 Jalankan backup

```bash
# Cukup jalankan (path service account sudah dikonfigurasi di package.json)
npm run backup
```

> ✅ **Done** — `backups/production-backup-2026-05-10/` berhasil dibuat.

### 1.3 Output backup

Script akan menghasilkan file-file berikut di folder `backups/`:

```
backups/
  production-backup-YYYY-MM-DD/
    users.json
    merchants.json
    merchants_products.json       # per-merchant
    merchants_sales.json          # per-merchant, per-date
    merchants_cashiers.json       # per-merchant
    merchants_expenses.json       # per-merchant
    backup-manifest.json          # metadata: timestamp, doc count per collection
```

### 1.4 Alternatif: Gunakan Firebase Console Export

Jika tidak ingin membuat script manual, gunakan built-in export dari Firebase Console:

```
Firebase Console → Firestore → Data → Export → Google Cloud Storage
```

Atau lewat CLI (membutuhkan Google Cloud Storage bucket):

```bash
gcloud firestore export gs://YOUR_BUCKET/backups/YYYY-MM-DD \
  --project=YOUR_PRODUCTION_PROJECT_ID
```

---

## Step 2 — Verifikasi Backup

> **Tujuan:** Memastikan backup berhasil dan data tidak korup sebelum melanjutkan.

### Checklist Verifikasi

- [x] File `users.json` ada dan berisi data user production (2 users)
- [x] File `merchants.json` ada dan berisi semua merchant (1 merchant: `blayag-dek-ani`)
- [x] Subcollection `products` (159 docs), `sales` (35 dates / 2.788 orders), `cashiers` (0), `expenses` (0) — semua ada
- [x] File `backup-manifest.json` mencantumkan jumlah dokumen yang dieksport
- [x] Bandingkan jumlah dokumen di backup dengan yang terlihat di Firebase Console

---

## Step 3 — Build Aplikasi React untuk Production

> **Tujuan:** Mengkompilasi aplikasi React dengan konfigurasi production.

### 3.1 Pastikan `.env.production` sudah benar

```
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=<production_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<production>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<production_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<production>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<production_sender_id>
VITE_FIREBASE_APP_ID=<production_app_id>
VITE_FIREBASE_MEASUREMENT_ID=<production_measurement_id>
```

### 3.2 Jalankan build production

```bash
npm run build
```

Script ini menjalankan `tsc -b && vite build --mode production` yang akan:

1. Type-check seluruh kodebase TypeScript
2. Bundle aplikasi menggunakan Vite dengan `.env.production`
3. Output ke folder `dist/`

### 3.3 Preview hasil build secara lokal (opsional)

```bash
npm run preview
```

Buka `http://localhost:4173` dan verifikasi aplikasi berjalan dengan config production (cek di Network tab — pastikan request ke Firebase project yang benar).

### 3.4 Checklist Build

- [x] Build berhasil tanpa error TypeScript
- [x] Folder `dist/` terbentuk (`dist/index.html`, `dist/assets/index.js` 1.3MB, `dist/assets/index.css` 32KB)
- [x] Tidak ada warning kritis di output build *(hanya chunk size warning, bukan error)*
- [ ] Preview lokal menampilkan halaman login tanpa error

---

## Step 4 — Deploy Firestore Indexes

> **Tujuan:** Mendeploy index Firestore yang dibutuhkan untuk compound queries (filter + order).

### 4.1 Deploy indexes

```bash
firebase deploy --only firestore:indexes
```

### 4.2 Pantau status index

- [x] Buka Firebase Console → Firestore → Indexes
- [x] `firestore.indexes.json` kosong — tidak ada compound index → deploy sukses, tidak ada index yang perlu di-build
- [x] Index building bisa memakan waktu beberapa menit hingga beberapa jam tergantung ukuran data

> ✅ **Done** — `firebase deploy --only firestore:indexes` berhasil di-deploy ke project `poswork`.

---

## Step 5 — Deploy Aplikasi React ke Vercel

> **Tujuan:** Mempublikasikan build React ke Vercel agar dapat diakses di URL production.

> **Catatan:** Firebase Hosting tidak digunakan. Firebase hanya digunakan untuk Firestore dan Authentication. Aplikasi web di-hosting di Vercel.

### 5.1 Konfigurasi `vercel.json` (jika belum ada)

Buat file `vercel.json` di root project untuk menghandle SPA routing React Router:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Rewrite ini diperlukan agar refresh halaman (misal `/products`) tidak menghasilkan 404 di Vercel.

### 5.2 Konfigurasi Environment Variables di Vercel Dashboard

Sebelum deploy, pastikan semua environment variables berikut sudah ditambahkan di:
**Vercel Dashboard → Project → Settings → Environment Variables** (set untuk environment **Production**):

```
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=<production_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<production>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<production_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<production>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<production_sender_id>
VITE_FIREBASE_APP_ID=<production_app_id>
VITE_FIREBASE_MEASUREMENT_ID=<production_measurement_id>
```

> ⚠️ **Penting:** Jangan masukkan nilai dari `.env.development` ke Vercel production. Pastikan semua nilai berasal dari Firebase project production.

### 5.3 Konfigurasi Build Settings di Vercel

Pastikan Vercel dikonfigurasi dengan build settings berikut (bisa diset via dashboard atau `vercel.json`):

| Setting | Nilai |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> Build command `npm run build` sudah menggunakan `.env.production` secara otomatis karena Vite membaca `--mode production` (default saat build).

### 5.4 Deploy via Git

Connect repository ke Vercel dan biarkan Vercel auto-deploy setiap push ke branch `main`/`master`:

1. Buka [vercel.com](https://vercel.com) → Import Project
2. Pilih repository GitHub/GitLab
3. Konfigurasi build settings dan environment variables
4. Klik **Deploy**

Untuk deployment berikutnya, cukup push ke branch `main`:

```bash
git push origin main
```

### 5.5 Checklist Vercel

- [ ] `vercel.json` dengan rewrite sudah ada di root project
- [ ] Semua environment variables production sudah dikonfigurasi di Vercel dashboard
- [ ] Build settings sudah benar (build command: `npm run build`, output: `dist`)
- [ ] Deploy berhasil tanpa error
- [ ] URL production Vercel dapat diakses (misal: `https://<project>.vercel.app`)
- [ ] Custom domain (jika ada) sudah diarahkan dan DNS sudah propagasi
- [ ] Firebase Authentication → Authorized domains sudah ditambahkan domain Vercel

> ⚠️ **Penting — Authorized Domains:** Setelah mendapat URL production Vercel, tambahkan domain tersebut ke Firebase Console → Authentication → Settings → Authorized domains. Jika tidak, Firebase Auth akan menolak login dari domain Vercel.

---

## Step 6 — Verifikasi Production

> **Tujuan:** Memastikan seluruh fitur dari Phase 1–8 berjalan benar di production.

### 6.1 Authentication

- [ ] Login sebagai **Superadmin** berhasil
- [ ] Login sebagai **Admin Merchant** berhasil
- [ ] Login sebagai **Supervisor** berhasil
- [ ] Login sebagai **Cashier** (role `cashier`) ditolak dengan pesan error yang sesuai
- [ ] Logout berfungsi

### 6.2 Halaman & Navigasi

- [ ] Dashboard menampilkan data yang benar sesuai role
- [ ] Halaman Merchants hanya dapat diakses oleh Superadmin
- [ ] Halaman Users: Superadmin melihat semua, Admin hanya melihat supervisor
- [ ] Halaman Cashiers: scoped per merchant
- [ ] Halaman Products: Superadmin semua merchant, Admin hanya merchant sendiri
- [ ] Halaman Sales: data sesuai merchant
- [ ] Halaman Expenses: data sesuai merchant dan role
- [ ] Halaman Reports (Profit & Loss): kalkulasi benar

### 6.3 Data Integrity

- [ ] Data merchant production masih ada dan tidak berubah
- [ ] Data produk masih ada dan tidak berubah
- [ ] Data sales masih ada dan tidak berubah
- [ ] Data cashiers masih ada dan tidak berubah
- [ ] Data expenses masih ada dan tidak berubah

### 6.4 Security Rules (Sementara — Test Mode)

> **Catatan:** Security Rules production yang ketat akan di-deploy di Phase 10. Untuk saat ini, pastikan rules yang berlaku tidak memblokir akses yang seharusnya diizinkan.

- [ ] Admin Merchant tidak dapat mengakses data merchant lain (basic check)
- [ ] Request tanpa autentikasi tidak dapat membaca data sensitif
- [ ] Supervisor hanya bisa baca sales dan expenses

### 6.5 Performa

- [ ] Halaman login load < 3 detik
- [ ] Tidak ada error di browser console (NetworkError, SecurityError, dsb)
- [ ] Tidak ada Firestore "Missing index" error di console

---

## Step 7 — Rollback Plan

> Gunakan jika terjadi masalah serius setelah deploy.

### 7.1 Rollback Vercel

Vercel menyimpan riwayat semua deployment. Untuk rollback ke versi sebelumnya:

1. Buka **Vercel Dashboard → Project → Deployments**
2. Pilih deployment sebelumnya yang berjalan baik
3. Klik **"Promote to Production"**

Atau via Vercel CLI:

```bash
# Lihat daftar deployment
vercel ls

# Promote deployment tertentu ke production
vercel promote <deployment-url>
```

### 7.2 Restore Data dari Backup (Skenario Terburuk)

Jika data terhapus atau korup, restore dari backup JSON yang sudah dibuat di Step 1:

```bash
# Jalankan script restore dari backup
npx tsx scripts/restore-production.ts --backup backups/production-backup-YYYY-MM-DD/
```

> Script restore perlu dibuat bersamaan dengan script backup di Step 1 — restore membaca file JSON dan menulis ulang ke Firestore menggunakan Firebase Admin SDK dengan operasi `set` (bukan `create`) agar tidak duplikat.

### 7.3 Restore dari Cloud Export (Firestore Native)

Jika menggunakan Cloud Storage export (Step 1 alternatif):

```bash
gcloud firestore import gs://YOUR_BUCKET/backups/YYYY-MM-DD \
  --project=YOUR_PRODUCTION_PROJECT_ID
```

---

## Urutan Eksekusi yang Direkomendasikan

```
1. Backup production data              ← Tidak boleh dilewati
2. Verifikasi backup                   ← Tidak boleh dilewati
3. Konfigurasi env vars di Vercel      ← Lakukan sekali sebelum deploy pertama
4. npm run build                       ← Verifikasi build lokal berhasil
5. firebase deploy --only firestore:indexes
6. push ke branch main  ← Vercel auto-deploy ke production
7. Tambahkan domain Vercel ke Firebase Auth Authorized Domains
8. Verifikasi manual di browser
9. Lanjutkan ke Phase 10 untuk deploy Security Rules
```

---

## Checklist Akhir

- [ ] Backup production selesai dan terverifikasi
- [ ] Build production berhasil (`dist/` ada)
- [ ] `vercel.json` dengan rewrite sudah ada
- [ ] Environment variables production sudah dikonfigurasi di Vercel dashboard
- [ ] Firestore Indexes sudah di-deploy
- [ ] Deploy ke Vercel berhasil dan URL dapat diakses
- [ ] Domain Vercel sudah ditambahkan ke Firebase Auth Authorized Domains
- [ ] Login semua role berhasil dari URL Vercel
- [ ] Semua halaman berfungsi sesuai role
- [ ] Data lama masih utuh
- [ ] Tidak ada error di browser console
- [ ] Rollback plan sudah dipahami dan siap jika dibutuhkan
- [ ] Siap melanjutkan ke [Phase 10 — Deploy Security Rules](./phase-10-deploy-security-rules.md)
