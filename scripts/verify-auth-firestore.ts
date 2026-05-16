/**
 * Step 6 Verification Script
 * Test Firestore access using Firebase Admin custom token (no password needed).
 * Tests read permissions for superadmin and blocks for wrong merchant.
 *
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=secrets/production-service-account.json npx tsx scripts/verify-auth-firestore.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import fetch from "node-fetch";

const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "secrets/production-service-account.json";

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`❌  Service account not found: ${CREDENTIALS_PATH}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
const PROJECT_ID = serviceAccount.project_id as string;
const API_KEY_FILE = ".env.production";

// Read API key from .env.production
function readApiKey(): string {
  if (!fs.existsSync(API_KEY_FILE)) {
    throw new Error(`${API_KEY_FILE} not found`);
  }
  const content = fs.readFileSync(API_KEY_FILE, "utf-8");
  const match = content.match(/VITE_FIREBASE_API_KEY=(.+)/);
  if (!match) throw new Error("VITE_FIREBASE_API_KEY not found in " + API_KEY_FILE);
  return match[1].trim();
}

// Exchange custom token for ID token via Firebase REST API
async function getIdToken(customToken: string, apiKey: string): Promise<string> {
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = (await resp.json()) as { idToken?: string; error?: { message: string } };
  if (!resp.ok || !data.idToken) {
    throw new Error(`Failed to exchange custom token: ${JSON.stringify(data.error)}`);
  }
  return data.idToken;
}

// Test a Firestore read with the ID token
async function testFirestoreRead(
  path: string,
  idToken: string,
  expectAllow: boolean,
  label: string
): Promise<boolean> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (resp.ok) {
    if (expectAllow) {
      console.log(`  ✅  ${label}: ALLOWED (expected)`);
      return true;
    } else {
      console.log(`  ❌  ${label}: ALLOWED (should be DENIED!)`);
      return false;
    }
  } else {
    const body = (await resp.json()) as { error?: { status: string } };
    const status = body.error?.status ?? "";
    if (!expectAllow && resp.status === 403) {
      console.log(`  ✅  ${label}: DENIED (403 ${status} — expected)`);
      return true;
    } else if (expectAllow) {
      console.log(`  ❌  ${label}: DENIED (403 ${status} — should be ALLOWED!)`);
      return false;
    } else {
      console.log(`  ⚠️  ${label}: HTTP ${resp.status} ${status}`);
      return false;
    }
  }
}

async function main() {
  initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });

  const apiKey = readApiKey();
  let passed = 0;
  let failed = 0;

  // ─── Test 1: Superadmin (read all) ───────────────────────────────────────
  const SUPERADMIN_UID = "xsIYbz1vTVXi5dzK0uds";
  console.log(`\n👤  Test as Superadmin (uid: ${SUPERADMIN_UID})\n`);

  const superToken = await getAuth().createCustomToken(SUPERADMIN_UID);
  const superIdToken = await getIdToken(superToken, apiKey);

  const superTests: [string, boolean, string][] = [
    ["users", true, "Read users collection"],
    ["merchants", true, "Read merchants collection"],
    ["merchants/blayag-dek-ani/products", true, "Read products subcollection"],
    ["merchants/blayag-dek-ani/sales", true, "Read sales subcollection"],
    ["merchants/blayag-dek-ani/expenses", true, "Read expenses subcollection"],
    ["merchants/blayag-dek-ani/cashiers", true, "Read cashiers subcollection"],
  ];

  for (const [path, expect, label] of superTests) {
    const ok = await testFirestoreRead(path, superIdToken, expect, label);
    ok ? passed++ : failed++;
  }

  // ─── Test 2: Fake merchant admin (wrong merchant) ─────────────────────────
  const FAKE_ADMIN_UID = "test-fake-admin-" + Date.now();
  console.log(`\n👤  Test as Fake Admin (wrong merchant — should be denied on other data)\n`);

  // Create a temporary test user in Firestore for this check
  const db = getFirestore();
  const fakeDoc = db.collection("users").doc(FAKE_ADMIN_UID);
  await fakeDoc.set({
    name: "Test Admin (verify script)",
    email: "test-verify@poswork.app",
    role: "admin",
    merchant: "test-merchant-that-does-not-exist",
  });

  try {
    const fakeToken = await getAuth().createCustomToken(FAKE_ADMIN_UID, {
      merchant: "test-merchant-that-does-not-exist",
      role: "admin",
    });
    const fakeIdToken = await getIdToken(fakeToken, apiKey);

    const fakeTests: [string, boolean, string][] = [
      ["merchants/blayag-dek-ani/products", false, "Admin wrong merchant → read blayag products"],
      ["merchants/blayag-dek-ani/sales", false, "Admin wrong merchant → read blayag sales"],
      ["merchants/blayag-dek-ani/expenses", false, "Admin wrong merchant → read blayag expenses"],
    ];

    for (const [path, expect, label] of fakeTests) {
      const ok = await testFirestoreRead(path, fakeIdToken, expect, label);
      ok ? passed++ : failed++;
    }
  } finally {
    await fakeDoc.delete();
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅  Passed: ${passed}  |  ❌  Failed: ${failed}`);
  if (failed === 0) {
    console.log("🎉  Semua security rules production berjalan dengan benar!\n");
  } else {
    console.log("⚠️  Ada security rules yang perlu diperbaiki!\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
