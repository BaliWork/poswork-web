# Phase 10 — Deploy Firestore Security Rules ke Production

> Part of the [Master Plan](./master-plan.md)  
> Dilakukan **setelah** [Phase 9 — Deploy to Production](./phase-9-deploy-to-production.md) selesai dan aplikasi sudah berjalan stabil di Vercel.

---

## Tujuan

Mengganti Firestore Security Rules production dari mode permisif (test mode / rules lama) ke rules yang ketat dan final sesuai Phase 6, mencakup semua koleksi dan role: `superadmin`, `admin`, `supervisor`.

> ⚠️ **Perhatian:** Rules Firestore berlaku **seketika** setelah di-deploy dan berdampak langsung ke semua client (web dan mobile) yang sedang aktif. Lakukan di luar jam sibuk jika memungkinkan.

---

## Prasyarat

Sebelum memulai, pastikan hal-hal berikut sudah terpenuhi:

- [ ] Phase 9 sudah selesai — aplikasi sudah live di Vercel dan berfungsi normal
- [ ] Firebase CLI sudah terinstall: `npm install -g firebase-tools`
- [ ] Sudah login ke Firebase CLI dengan akun yang memiliki akses ke project production: `firebase login`
- [ ] Firebase project production sudah di-set sebagai active project: `firebase use <production_project_id>`
- [ ] File `firestore.rules` di repository sudah berisi rules final (dari Phase 6)
- [ ] Rules sudah diuji di emulator atau development environment

---

## Ringkasan Rules yang Akan Di-deploy

Rules mencakup proteksi untuk semua koleksi:

| Koleksi | Superadmin | Admin Merchant | Supervisor |
|---|---|---|---|
| `users` | Read/Write semua | Read/Write supervisor own merchant | Read own profile |
| `merchants` | Read/Write semua | Read own merchant | Read own merchant |
| `merchants/products` | Read/Write semua | Read/Write own merchant | Tidak ada akses |
| `merchants/sales` | Read/Write semua | Read/Write own merchant | Read only |
| `merchants/cashiers` | Read/Write semua | Read/Write own merchant | Tidak ada akses |
| `merchants/expenses` | Read/Write semua | Read/Write own merchant | Read/Write own merchant |

> Default semua request yang tidak cocok dengan rule di atas: **ditolak (deny)**.

---

## Step 1 — Verifikasi File `firestore.rules`

> **Tujuan:** Memastikan file rules di repository sudah benar sebelum di-deploy.

### 1.1 Cek isi file rules

```bash
cat firestore.rules
```

Pastikan rules yang ada sesuai dengan yang didefinisikan di Phase 6, mencakup semua fungsi helper dan semua koleksi/subcollection.

### 1.2 Validasi syntax rules via Firebase CLI

```bash
firebase firestore:rules --validate
```

Perintah ini akan mengecek apakah syntax rules valid tanpa perlu deploy ke production.

### 1.3 Checklist

- [ ] Semua fungsi helper ada: `isSignedIn`, `getUser`, `isSuperadmin`, `isAdmin`, `isSupervisor`, `isAdminOfMerchant`, `isSupervisorOfMerchant`
- [ ] Semua koleksi tercakup: `users`, `merchants`, `products`, `sales`, `cashiers`, `expenses`
- [ ] Tidak ada koleksi yang menggunakan `allow read, write: if true` (open access)
- [ ] Syntax valid (tidak ada error dari `--validate`)

---

## Step 2 — Test Rules di Emulator (Opsional tapi Direkomendasikan)

> **Tujuan:** Memverifikasi rules bekerja sesuai harapan sebelum diterapkan ke production.

### 2.1 Jalankan Firebase Emulator

```bash
firebase emulators:start --only firestore,auth
```

### 2.2 Jalankan test suite yang ada

```bash
npm run test
```

### 2.3 Test manual via Emulator UI

Buka `http://localhost:4000` → Firestore → coba baca/tulis dokumen dengan berbagai kondisi auth.

### 2.4 Checklist

- [ ] Login sebagai superadmin dapat membaca semua koleksi
- [ ] Login sebagai admin hanya dapat membaca/menulis data merchant sendiri
- [ ] Login sebagai supervisor tidak dapat mengakses products dan cashiers
- [ ] Request tanpa autentikasi mendapatkan `PERMISSION_DENIED`

---

## Step 3 — Set Active Firebase Project ke Production

> **Tujuan:** Memastikan Firebase CLI mengarah ke project production, bukan development.

### 3.1 Cek project aktif saat ini

```bash
firebase use
```

Output akan menampilkan project yang sedang aktif. Pastikan ini adalah project **production**.

### 3.2 Ganti ke production jika belum

```bash
firebase use <production_project_id>
```

Atau jika sudah dikonfigurasi alias di `.firebaserc`:

```bash
firebase use production
```

### 3.3 Verifikasi

```bash
firebase projects:list
# Pastikan tanda (*) ada di sebelah production project
```

---

## Step 4 — Deploy Security Rules ke Production

> **Tujuan:** Menerapkan rules final ke Firestore production.

### 4.1 Deploy rules

```bash
firebase deploy --only firestore:rules
```

### 4.2 Verifikasi di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com) → pilih project production
2. Navigasi ke **Firestore → Rules**
3. Pastikan:
   - Timestamp rules sudah diperbarui
   - Isi rules sesuai dengan yang ada di file `firestore.rules`
   - Tidak ada error atau warning di console

### 4.3 Checklist Deploy

- [ ] Command `firebase deploy --only firestore:rules` berhasil tanpa error
- [ ] Rules di Firebase Console sudah terupdate (cek timestamp)
- [ ] Tidak ada error "Rules compilation failed" di Firebase Console

---

## Step 5 — Verifikasi Rules di Production

> **Tujuan:** Memastikan rules yang sudah di-deploy tidak memblokir akses yang seharusnya diizinkan dan memblokir akses yang tidak diizinkan.

### 5.1 Test login dan akses data

Buka aplikasi production di Vercel dan lakukan pengujian:

- [ ] Login sebagai **Superadmin** → dapat mengakses semua halaman dan semua data
- [ ] Login sebagai **Admin Merchant** → hanya dapat mengakses data merchant sendiri
- [ ] Login sebagai **Supervisor** → dapat melihat sales dan expenses, tetapi tidak bisa edit products
- [ ] Login sebagai akun yang tidak ada di Firestore → gagal dengan pesan yang sesuai

### 5.2 Test operasi CRUD

- [ ] Superadmin dapat menambah/edit/hapus merchant
- [ ] Admin dapat menambah/edit/hapus produk di merchant sendiri
- [ ] Admin tidak dapat mengakses produk merchant lain (cek di browser console — harus ada `PERMISSION_DENIED`)
- [ ] Supervisor dapat menambah expense
- [ ] Supervisor tidak dapat mengakses halaman Products (di-block di app level)

### 5.3 Test Firebase Rules Playground (Opsional)

Gunakan Rules Playground di Firebase Console untuk simulasi request:

```
Firebase Console → Firestore → Rules → Rules Playground
```

---

## Step 6 — Rollback Rules (Jika Diperlukan)

> Gunakan jika rules baru menyebabkan masalah akses di production.

### 6.1 Rollback via Firebase Console

1. Buka Firebase Console → Firestore → Rules → **Rules History**
2. Pilih versi rules sebelumnya
3. Klik **"Restore this version"**

Rules lama akan langsung aktif kembali.

### 6.2 Rollback via CLI

Edit file `firestore.rules` ke konten rules sebelumnya, lalu deploy ulang:

```bash
firebase deploy --only firestore:rules
```

---

## Urutan Eksekusi yang Direkomendasikan

```
1. Verifikasi isi firestore.rules
2. firebase firestore:rules --validate       ← Cek syntax
3. (Opsional) npm run test                   ← Test di emulator
4. firebase use <production_project_id>      ← Pastikan target production
5. firebase deploy --only firestore:rules
6. Buka Firebase Console → verifikasi timestamp rules
7. Test login dan akses data di URL Vercel production
```

---

## Checklist Akhir

- [ ] File `firestore.rules` sudah berisi rules final dari Phase 6
- [ ] Syntax rules valid (tidak ada error dari `--validate`)
- [ ] Firebase CLI mengarah ke project production
- [ ] Deploy berhasil tanpa error
- [ ] Rules terupdate di Firebase Console (cek timestamp)
- [ ] Login semua role berfungsi normal setelah rules baru aktif
- [ ] Admin Merchant tidak dapat mengakses data merchant lain
- [ ] Supervisor tidak dapat mengakses products dan cashiers
- [ ] Request tanpa auth mendapatkan `PERMISSION_DENIED`
- [ ] Rollback plan sudah dipahami dan siap jika dibutuhkan
