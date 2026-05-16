/**
 * scripts/add-authorized-domain.ts
 *
 * Menambahkan domain ke Firebase Auth Authorized Domains via Identity Toolkit API.
 *
 * Usage:
 *   npm run add-domain
 *
 * Requires: secrets/production-service-account.json
 */

import { initializeApp, cert } from "firebase-admin/app";
import { GoogleAuth } from "google-auth-library";
import * as fs from "fs";

const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "secrets/production-service-account.json";
const PROJECT_ID = "poswork";
const DOMAIN_TO_ADD = process.argv[2] ?? "poswork-web.vercel.app";

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`❌  Service account not found: ${CREDENTIALS_PATH}`);
  process.exit(1);
}

// Init Firebase Admin (needed to resolve project)
initializeApp({ credential: cert(CREDENTIALS_PATH) });

async function run() {
  console.log(`\n🔑  Authenticating with service account...`);

  const auth = new GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    console.error("❌  Failed to get access token.");
    process.exit(1);
  }

  const baseUrl = `https://identitytoolkit.googleapis.com/v2/projects/${PROJECT_ID}/config`;

  // ── 1. Baca konfigurasi saat ini ──────────────────────────────────────────
  console.log(`📖  Fetching current authorized domains...`);
  const getRes = await fetch(baseUrl, {
    headers: { Authorization: `Bearer ${token.token}` },
  });

  if (!getRes.ok) {
    const err = await getRes.text();
    console.error(`❌  Failed to fetch config: ${getRes.status}\n${err}`);
    process.exit(1);
  }

  const config = (await getRes.json()) as { authorizedDomains?: string[] };
  const currentDomains: string[] = config.authorizedDomains ?? [];

  console.log(`  Current domains (${currentDomains.length}):`);
  currentDomains.forEach((d) => console.log(`    - ${d}`));

  if (currentDomains.includes(DOMAIN_TO_ADD)) {
    console.log(`\n✅  Domain "${DOMAIN_TO_ADD}" sudah ada. Tidak perlu ditambahkan.`);
    process.exit(0);
  }

  // ── 2. Tambahkan domain baru ───────────────────────────────────────────────
  const updatedDomains = [...currentDomains, DOMAIN_TO_ADD];
  console.log(`\n➕  Adding domain: ${DOMAIN_TO_ADD}`);

  const patchRes = await fetch(`${baseUrl}?updateMask=authorizedDomains`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authorizedDomains: updatedDomains }),
  });

  if (!patchRes.ok) {
    const err = await patchRes.text();
    console.error(`❌  Failed to update config: ${patchRes.status}\n${err}`);
    process.exit(1);
  }

  console.log(`\n✅  Domain "${DOMAIN_TO_ADD}" berhasil ditambahkan ke Firebase Auth Authorized Domains.`);
  console.log(`\n📋  Updated domains (${updatedDomains.length}):`);
  updatedDomains.forEach((d) => console.log(`    - ${d}`));
  console.log();

  process.exit(0);
}

run().catch((err) => {
  console.error("❌  Error:", err);
  process.exit(1);
});
