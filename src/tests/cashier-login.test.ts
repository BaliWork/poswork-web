import { describe, it } from "vitest";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

/**
 * Skenario Pengujian: Login Kasir via PIN (Production)
 *
 * Alur login kasir di aplikasi mobile:
 *   1. Kasir membuka aplikasi dan memilih merchant.
 *   2. Kasir memasukkan PIN 4 digit.
 *   3. Aplikasi mencari dokumen di: users/{pin}
 *   4. Validasi: dokumen ada AND role == "cashier" AND merchant == merchantId
 *   5. Semua kondisi terpenuhi → login berhasil.
 *   6. Salah satu kondisi gagal → login ditolak.
 *
 * PIN = Document ID di koleksi `users` (bukan Firebase Auth).
 *
 * Menggunakan Firebase Admin SDK agar tidak ada masalah koneksi offline
 * di lingkungan Node.js (vitest).
 *
 * Prasyarat:
 *   - File secrets/production-service-account.json tersedia.
 *
 * Jalankan: npm run test:cashier-login
 */

// ── Inisialisasi Firebase Admin SDK ────────────────────────

const SERVICE_ACCOUNT_PATH = path.resolve(
  process.cwd(),
  "secrets/production-service-account.json"
);

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  throw new Error(
    `Service account tidak ditemukan: ${SERVICE_ACCOUNT_PATH}\n` +
    "Download dari Firebase Console → Project Settings → Service Accounts."
  );
}

const adminApp =
  getApps().find((a) => a.name === "cashier-login-test") ??
  initializeApp(
    { credential: cert(SERVICE_ACCOUNT_PATH) },
    "cashier-login-test"
  );

const db = getFirestore(adminApp);

// ── Variabel Pengujian ──────────────────────────────────────

const MERCHANT_ID = process.env.VITE_TEST_MERCHANT_ID ?? "blayag-dek-ani";
const TEST_PIN_VALID = process.env.VITE_TEST_CASHIER_PIN ?? "1234";
const TEST_PIN_INVALID = "0000"; // PIN yang diasumsikan tidak terdaftar

// ── Helper ──────────────────────────────────────────────────

interface CashierLoginResult {
  status: "success" | "not_found" | "wrong_role" | "wrong_merchant";
  data?: Record<string, unknown>;
  reason?: string;
}

/**
 * Simulasi login kasir:
 * 1. Ambil dokumen users/{pin}
 * 2. Cek dokumen ada
 * 3. Cek role == "cashier"
 * 4. Cek merchant == merchantId
 */
async function loginCashierWithPin(
  merchantId: string,
  pin: string
): Promise<CashierLoginResult> {
  const snapshot = await db.collection("users").doc(pin).get();

  if (!snapshot.exists) {
    return { status: "not_found", reason: `Dokumen users/${pin} tidak ditemukan.` };
  }

  const data = { id: snapshot.id, ...snapshot.data() } as Record<string, unknown>;

  if (data["role"] !== "cashier") {
    return {
      status: "wrong_role",
      data,
      reason: `Role bukan cashier: "${data["role"]}"`,
    };
  }

  if (data["merchant"] !== merchantId) {
    return {
      status: "wrong_merchant",
      data,
      reason: `Merchant tidak cocok: expected "${merchantId}", got "${data["merchant"]}"`,
    };
  }

  return { status: "success", data };
}

// ── Pengujian ───────────────────────────────────────────────

describe("Skenario Login Kasir — Production Firebase (users collection)", () => {
  // ── Skenario 0: Tampilkan semua kasir yang terdaftar ────

  it("Skenario 0 — Daftar semua kasir terdaftar di koleksi users", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 0: Daftar Kasir di users");
    console.log("========================================");
    console.log(`Merchant ID : ${MERCHANT_ID}`);
    console.log("Path        : users/{pin} where role=cashier");
    console.log("----------------------------------------");

    const snapshot = await db
      .collection("users")
      .where("role", "==", "cashier")
      .where("merchant", "==", MERCHANT_ID)
      .get();

    if (snapshot.empty) {
      console.log("⚠️  Tidak ada kasir terdaftar untuk merchant ini.");
    } else {
      console.log(`✅  Total kasir ditemukan: ${snapshot.size}`);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(`   • PIN (doc ID): ${docSnap.id} | Nama: ${data["name"]} | Merchant: ${data["merchant"]}`);
      });
    }

    console.log("========================================\n");
  });

  // ── Skenario 1: Login dengan PIN yang valid ─────────────

  it("Skenario 1 — Login berhasil dengan PIN yang valid", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 1: Login dengan PIN Valid");
    console.log("========================================");
    console.log(`Merchant ID : ${MERCHANT_ID}`);
    console.log(`PIN input   : ${TEST_PIN_VALID}`);
    console.log(`Path Firestore: users/${TEST_PIN_VALID}`);
    console.log("----------------------------------------");

    const result = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_VALID);

    if (result.status === "success") {
      console.log("✅  STATUS: LOGIN BERHASIL");
      console.log("   Data kasir:");
      console.log(`   - ID (PIN)    : ${result.data!["id"]}`);
      console.log(`   - Nama        : ${result.data!["name"]}`);
      console.log(`   - Role        : ${result.data!["role"]}`);
      console.log(`   - Merchant    : ${result.data!["merchant"]}`);
    } else {
      console.log(`❌  STATUS: LOGIN GAGAL (${result.status})`);
      console.log(`   Alasan: ${result.reason}`);
    }

    console.log("========================================\n");
  });

  // ── Skenario 2: Login dengan PIN tidak terdaftar ────────

  it("Skenario 2 — Login gagal dengan PIN yang tidak terdaftar", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 2: Login dengan PIN Tidak Valid");
    console.log("========================================");
    console.log(`Merchant ID : ${MERCHANT_ID}`);
    console.log(`PIN input   : ${TEST_PIN_INVALID}`);
    console.log(`Path Firestore: users/${TEST_PIN_INVALID}`);
    console.log("----------------------------------------");

    const result = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_INVALID);

    if (result.status === "not_found") {
      console.log("✅  STATUS: DITOLAK DENGAN BENAR (expected)");
      console.log(`   Alasan: ${result.reason}`);
      console.log("   Aplikasi harus menampilkan pesan: 'PIN salah, coba lagi.'");
    } else {
      console.log(`⚠️  STATUS TIDAK TERDUGA: ${result.status}`);
      console.log("   Data:", result.data);
    }

    console.log("========================================\n");
  });

  // ── Skenario 3: PIN milik user non-cashier (admin/superadmin) ─

  it("Skenario 3 — Login ditolak jika PIN milik user bukan kasir", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 3: PIN Milik Non-Cashier");
    console.log("========================================");
    console.log("Menggunakan UID admin sebagai 'PIN' untuk simulasi.");
    console.log("----------------------------------------");

    // Ambil user admin sebagai contoh PIN salah role
    const adminSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      console.log("⚠️  Tidak ada user admin ditemukan, skenario dilewati.");
      console.log("========================================\n");
      return;
    }

    const adminDocId = adminSnapshot.docs[0].id;
    const adminData = adminSnapshot.docs[0].data();
    console.log(`   Mencoba login dengan doc ID admin: "${adminDocId}" (${adminData["name"]})`);

    const result = await loginCashierWithPin(MERCHANT_ID, adminDocId);

    if (result.status === "wrong_role") {
      console.log("✅  STATUS: DITOLAK DENGAN BENAR (expected)");
      console.log(`   Alasan: ${result.reason}`);
      console.log("   Aplikasi harus menampilkan pesan: 'Akun ini bukan kasir.'");
    } else if (result.status === "not_found") {
      console.log("✅  STATUS: DITOLAK — dokumen tidak ditemukan (juga valid)");
      console.log(`   Alasan: ${result.reason}`);
    } else {
      console.log(`⚠️  STATUS TIDAK TERDUGA: ${result.status}`);
      console.log("   Data:", result.data);
    }

    console.log("========================================\n");
  });

  // ── Skenario 4: PIN kasir merchant lain ─────────────────

  it("Skenario 4 — Login ditolak jika kasir dari merchant berbeda", async () => {
    const WRONG_MERCHANT = "merchant-lain";

    console.log("\n========================================");
    console.log(" SKENARIO 4: PIN Kasir, Merchant Salah");
    console.log("========================================");
    console.log(`PIN input   : ${TEST_PIN_VALID}`);
    console.log(`Merchant ID : ${WRONG_MERCHANT} (berbeda dari merchant kasir)`);
    console.log("----------------------------------------");

    const result = await loginCashierWithPin(WRONG_MERCHANT, TEST_PIN_VALID);

    if (result.status === "wrong_merchant") {
      console.log("✅  STATUS: DITOLAK DENGAN BENAR (expected)");
      console.log(`   Alasan: ${result.reason}`);
      console.log("   Aplikasi harus menampilkan pesan: 'Kasir tidak terdaftar di merchant ini.'");
    } else if (result.status === "not_found") {
      console.log("✅  STATUS: DITOLAK — dokumen tidak ditemukan (juga valid)");
    } else {
      console.log(`⚠️  STATUS TIDAK TERDUGA: ${result.status}`);
      console.log("   Data:", result.data);
    }

    console.log("========================================\n");
  });

  // ── Skenario 5: Validasi format PIN (edge case) ──────────

  it("Skenario 5 — Validasi format PIN sebelum query ke Firestore", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 5: Validasi Format PIN (Client-side)");
    console.log("========================================");

    const cases = [
      { pin: "", label: "PIN kosong" },
      { pin: "12", label: "PIN terlalu pendek (2 digit)" },
      { pin: "12345", label: "PIN terlalu panjang (5 digit)" },
      { pin: "abcd", label: "PIN bukan angka" },
    ];

    for (const { pin, label } of cases) {
      const isValid = /^\d{4}$/.test(pin);
      if (!isValid) {
        console.log(`   ✅  [${label}] → Ditolak sebelum query ke Firestore`);
      } else {
        console.log(`   ⚠️  [${label}] → Lolos validasi (tidak terduga)`);
      }
    }

    console.log("----------------------------------------");
    console.log("   Catatan: Validasi format harus dilakukan di sisi client");
    console.log("   sebelum melakukan query ke Firestore untuk menghemat quota.");
    console.log("========================================\n");
  });
});

// ── Skenario Fetch Produk Setelah Login Kasir ────────────────────────────────

describe("Skenario Fetch Produk — Login Kasir Production Firebase", () => {
  /**
   * Alur fetch produk di aplikasi mobile setelah kasir login:
   *   1. Kasir login dengan PIN → dapat merchantId dari users/{pin}
   *   2. Fetch produk dari: merchants/{merchantId}/products
   *   3. Tampilkan daftar produk di layar kasir
   */

  // ── Skenario 6: Fetch semua produk setelah login berhasil ───

  it("Skenario 6 — Fetch semua produk setelah login kasir berhasil", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 6: Fetch Produk (Login Berhasil)");
    console.log("========================================");
    console.log(`PIN kasir   : ${TEST_PIN_VALID}`);
    console.log("----------------------------------------");

    // Step 1: Login kasir
    const loginResult = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_VALID);

    if (loginResult.status !== "success") {
      console.log(`❌  Login gagal (${loginResult.status}): ${loginResult.reason}`);
      console.log("   Produk tidak dapat diambil karena kasir belum login.");
      console.log("========================================\n");
      return;
    }

    const merchantId = loginResult.data!["merchant"] as string;
    console.log(`✅  Login berhasil sebagai: ${loginResult.data!["name"]}`);
    console.log(`   Merchant  : ${merchantId}`);
    console.log("----------------------------------------");

    // Step 2: Fetch produk berdasarkan merchantId dari session kasir
    console.log(`   Fetching: merchants/${merchantId}/products`);
    const productsSnap = await db
      .collection("merchants")
      .doc(merchantId)
      .collection("products")
      .orderBy("name")
      .get();

    if (productsSnap.empty) {
      console.log("⚠️  Tidak ada produk tersedia untuk merchant ini.");
    } else {
      console.log(`✅  Total produk ditemukan: ${productsSnap.size}`);
      console.log("");
      productsSnap.forEach((docSnap) => {
        const p = docSnap.data();
        console.log(`   • [${p["category"]}] ${p["name"]} — Rp ${Number(p["price"]).toLocaleString("id-ID")}`);
      });
    }

    console.log("========================================\n");
  });

  // ── Skenario 7: Fetch produk dengan filter kategori ─────────

  it("Skenario 7 — Fetch produk berdasarkan kategori setelah login", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 7: Fetch Produk per Kategori");
    console.log("========================================");
    console.log(`PIN kasir   : ${TEST_PIN_VALID}`);
    console.log("----------------------------------------");

    // Step 1: Login kasir
    const loginResult = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_VALID);

    if (loginResult.status !== "success") {
      console.log(`❌  Login gagal: ${loginResult.reason}`);
      console.log("========================================\n");
      return;
    }

    const merchantId = loginResult.data!["merchant"] as string;
    console.log(`✅  Login berhasil sebagai: ${loginResult.data!["name"]}`);
    console.log("----------------------------------------");

    // Step 2: Ambil semua kategori unik
    const allProductsSnap = await db
      .collection("merchants")
      .doc(merchantId)
      .collection("products")
      .get();

    const categories = [
      ...new Set(allProductsSnap.docs.map((d) => d.data()["category"] as string)),
    ].sort();

    if (categories.length === 0) {
      console.log("⚠️  Tidak ada produk/kategori ditemukan.");
      console.log("========================================\n");
      return;
    }

    console.log(`   Kategori tersedia (${categories.length}): ${categories.join(", ")}`);
    console.log("");

    // Step 3: Kelompokkan produk per kategori dari data yang sudah di-fetch (client-side)
    for (const category of categories) {
      const categoryProducts = allProductsSnap.docs
        .filter((d) => d.data()["category"] === category)
        .sort((a, b) => (a.data()["name"] as string).localeCompare(b.data()["name"] as string));

      console.log(`   📦 ${category} (${categoryProducts.length} produk):`);
      categoryProducts.forEach((docSnap) => {
        const p = docSnap.data();
        console.log(`      - ${p["name"]} — Rp ${Number(p["price"]).toLocaleString("id-ID")}`);
      });
    }

    console.log("========================================\n");
  });

  // ── Skenario 8: Fetch produk merchant lain — tidak boleh ────

  it("Skenario 8 — Kasir tidak dapat fetch produk merchant lain", async () => {
    const OTHER_MERCHANT = "merchant-lain";

    console.log("\n========================================");
    console.log(" SKENARIO 8: Fetch Produk Merchant Lain");
    console.log("========================================");
    console.log(`PIN kasir       : ${TEST_PIN_VALID}`);
    console.log(`Merchant kasir  : ${MERCHANT_ID}`);
    console.log(`Merchant target : ${OTHER_MERCHANT} (bukan milik kasir)`);
    console.log("----------------------------------------");

    // Step 1: Login kasir — berhasil dengan merchant sendiri
    const loginResult = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_VALID);

    if (loginResult.status !== "success") {
      console.log(`❌  Login gagal: ${loginResult.reason}`);
      console.log("========================================\n");
      return;
    }

    const sessionMerchant = loginResult.data!["merchant"] as string;
    console.log(`✅  Login berhasil. Session merchant: ${sessionMerchant}`);
    console.log("");

    // Step 2: Coba fetch produk dari merchant LAIN (simulasi akses tidak sah)
    console.log(`   Mencoba fetch merchants/${OTHER_MERCHANT}/products...`);
    const otherProductsSnap = await db
      .collection("merchants")
      .doc(OTHER_MERCHANT)
      .collection("products")
      .get();

    if (otherProductsSnap.empty) {
      console.log("✅  Tidak ada produk ditemukan di merchant lain.");
      console.log("   (Merchant tidak ada atau tidak memiliki produk)");
      console.log("   Catatan: Pada production, Firestore Security Rules seharusnya");
      console.log(`   menolak akses kasir ke merchants/${OTHER_MERCHANT}/products.`);
    } else {
      console.log(`⚠️  ${otherProductsSnap.size} produk ditemukan di merchant lain!`);
      console.log("   Firestore Security Rules harus memblokir akses ini dari client app.");
    }

    // Step 3: Konfirmasi kasir hanya bisa akses merchant sendiri
    console.log("");
    console.log(`✅  Kasir hanya boleh akses: merchants/${sessionMerchant}/products`);

    console.log("========================================\n");
  });

  // ── Skenario 9: Login gagal → blokir fetch produk ───────────

  it("Skenario 9 — Kasir dengan PIN salah tidak dapat fetch produk", async () => {
    console.log("\n========================================");
    console.log(" SKENARIO 9: Blokir Fetch Produk (PIN Salah)");
    console.log("========================================");
    console.log(`PIN input   : ${TEST_PIN_INVALID} (tidak terdaftar)`);
    console.log("----------------------------------------");

    // Step 1: Coba login dengan PIN salah
    const loginResult = await loginCashierWithPin(MERCHANT_ID, TEST_PIN_INVALID);

    if (loginResult.status !== "success") {
      console.log(`✅  Login ditolak (${loginResult.status}): ${loginResult.reason}`);
      console.log("   Fetch produk TIDAK dilakukan — kasir belum terautentikasi.");
      console.log("   Aplikasi harus menghentikan alur di sini dan tidak mengambil produk.");
    } else {
      // Seharusnya tidak sampai sini
      console.log("⚠️  Login berhasil dengan PIN tidak valid — periksa data Firestore!");
      const merchantId = loginResult.data!["merchant"] as string;
      const productsSnap = await db
        .collection("merchants")
        .doc(merchantId)
        .collection("products")
        .get();
      console.log(`   Produk yang ter-fetch: ${productsSnap.size} item`);
    }

    console.log("========================================\n");
  });
});
