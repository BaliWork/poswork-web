/**
 * scripts/backup-production.ts
 *
 * Backup semua data Firestore production ke file JSON lokal.
 *
 * Prerequisites:
 *   1. Download service account JSON dari Firebase Console:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Set environment variable:
 *      export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
 *   3. Jalankan:
 *      npm run backup
 *
 * Output: backups/production-backup-YYYY-MM-DD/
 */

import { initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// ── Init Firebase Admin ────────────────────────────────────────────────────────

const DEFAULT_CREDENTIALS_PATH = "secrets/production-service-account.json";
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

if (!fs.existsSync(credentialsPath)) {
  console.error(
    "❌  Service account file not found.\n\n" +
      "    Letakkan file service account di:\n" +
      `    📁  ${DEFAULT_CREDENTIALS_PATH}\n\n` +
      "    Cara mendapatkannya:\n" +
      "    1. Firebase Console → Project Settings → Service Accounts\n" +
      "    2. Klik 'Generate new private key'\n" +
      "    3. Rename file → production-service-account.json\n" +
      `    4. Pindahkan ke: ${DEFAULT_CREDENTIALS_PATH}\n`
  );
  process.exit(1);
}

let app: App;
try {
  app = initializeApp({
    credential: cert(credentialsPath),
  });
} catch (err) {
  console.error("❌  Failed to initialize Firebase Admin:", err);
  process.exit(1);
}

const db: Firestore = getFirestore(app);

// ── Helpers ────────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✅  Saved: ${filePath}`);
}

interface DocData {
  [key: string]: unknown;
}

async function fetchCollection(collectionPath: string): Promise<DocData[]> {
  const snapshot = await db.collection(collectionPath).get();
  return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
}

// ── Main Backup ────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const backupDate = today();
  const backupDir = path.join("backups", `production-backup-${backupDate}`);
  ensureDir(backupDir);

  console.log(`\n📦  Starting production backup → ${backupDir}\n`);

  const manifest: {
    timestamp: string;
    collections: Record<string, number>;
  } = {
    timestamp: new Date().toISOString(),
    collections: {},
  };

  // ── 1. users ────────────────────────────────────────────────────────────────
  console.log("🔄  Backing up: users");
  const users = await fetchCollection("users");
  writeJson(path.join(backupDir, "users.json"), users);
  manifest.collections["users"] = users.length;

  // ── 2. merchants ────────────────────────────────────────────────────────────
  console.log("🔄  Backing up: merchants");
  const merchantsSnapshot = await db.collection("merchants").get();
  const merchantDocs = merchantsSnapshot.docs.map((doc) => ({
    _id: doc.id,
    ...doc.data(),
  }));
  writeJson(path.join(backupDir, "merchants.json"), merchantDocs);
  manifest.collections["merchants"] = merchantDocs.length;

  // ── 3. Subcollections per merchant ──────────────────────────────────────────
  const subcollections = ["products", "sales", "cashiers", "expenses"] as const;

  const allProducts: Record<string, DocData[]> = {};
  const allSales: Record<string, DocData[]> = {};
  const allCashiers: Record<string, DocData[]> = {};
  const allExpenses: Record<string, DocData[]> = {};

  const subcollectionMaps = {
    products: allProducts,
    sales: allSales,
    cashiers: allCashiers,
    expenses: allExpenses,
  };

  for (const merchantDoc of merchantsSnapshot.docs) {
    const merchantId = merchantDoc.id;
    console.log(`  🔄  Merchant: ${merchantId}`);

    for (const sub of subcollections) {
      const docs = await fetchCollection(`merchants/${merchantId}/${sub}`);
      subcollectionMaps[sub][merchantId] = docs;
      console.log(`        └─ ${sub}: ${docs.length} docs`);
    }
  }

  // Write subcollection files
  writeJson(path.join(backupDir, "merchants_products.json"), allProducts);
  writeJson(path.join(backupDir, "merchants_sales.json"), allSales);
  writeJson(path.join(backupDir, "merchants_cashiers.json"), allCashiers);
  writeJson(path.join(backupDir, "merchants_expenses.json"), allExpenses);

  // Count totals for manifest
  const countSubcollection = (map: Record<string, DocData[]>): number =>
    Object.values(map).reduce((sum, arr) => sum + arr.length, 0);

  manifest.collections["merchants/*/products"] = countSubcollection(allProducts);
  manifest.collections["merchants/*/sales"] = countSubcollection(allSales);
  manifest.collections["merchants/*/cashiers"] = countSubcollection(allCashiers);
  manifest.collections["merchants/*/expenses"] = countSubcollection(allExpenses);

  // ── 4. Write manifest ────────────────────────────────────────────────────────
  writeJson(path.join(backupDir, "backup-manifest.json"), manifest);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n📊  Backup Summary:");
  for (const [col, count] of Object.entries(manifest.collections)) {
    console.log(`  ${col.padEnd(30)} ${count} docs`);
  }
  const totalDocs = Object.values(manifest.collections).reduce((a, b) => a + b, 0);
  console.log(`  ${"TOTAL".padEnd(30)} ${totalDocs} docs`);
  console.log(`\n✅  Backup completed: ${backupDir}\n`);

  process.exit(0);
}

run().catch((err) => {
  console.error("❌  Backup failed:", err);
  process.exit(1);
});
