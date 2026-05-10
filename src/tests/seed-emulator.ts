/**
 * seed-emulator.ts
 *
 * Seeds Firebase Auth and Firestore EMULATORS via their REST APIs.
 * No credentials required — emulators accept unauthenticated REST calls.
 *
 * Usage: npx tsx src/tests/seed-emulator.ts
 * Prerequisites: firebase emulators:start --only auth,firestore --project demo-poswork
 */

const AUTH_HOST = "http://127.0.0.1:9099";
const FIRESTORE_HOST = "http://127.0.0.1:8080";
const PROJECT = "demo-poswork";
const TEST_PASSWORD = "Test123456!";
const MERCHANT_ID = "blayag-dek-ani";

// ── Auth emulator helpers ────────────────────────────────────

async function createAuthUser(email: string, password: string): Promise<string> {
  // Try to create the user
  const res = await fetch(
    `${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (res.ok) {
    const data = (await res.json()) as { localId: string };
    return data.localId;
  }

  const errBody = (await res.json()) as { error?: { message?: string } };
  if (errBody.error?.message === "EMAIL_EXISTS") {
    // Sign in to get the UID
    const signinRes = await fetch(
      `${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const signinData = (await signinRes.json()) as { localId?: string; error?: { message?: string } };
    if (!signinData.localId) {
      // Delete and recreate — password may differ in emulator
      await deleteAuthUserByEmail(email);
      return createAuthUser(email, password);
    }
    return signinData.localId;
  }
  throw new Error(`createAuthUser failed for ${email}: ${JSON.stringify(errBody)}`);
}

async function deleteAuthUserByEmail(email: string): Promise<void> {
  const listRes = await fetch(
    `${AUTH_HOST}/emulator/v1/projects/${PROJECT}/accounts`,
    { method: "GET" }
  );
  const list = (await listRes.json()) as { users?: Array<{ localId: string; email: string }> };
  const user = list.users?.find((u) => u.email === email);
  if (user) {
    await fetch(
      `${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-key`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localId: user.localId }),
      }
    );
  }
}

// ── Firestore emulator helpers ──────────────────────────────

function toFirestoreFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") fields[key] = { stringValue: value };
    else if (typeof value === "number") fields[key] = { integerValue: String(value) };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    else if (value === null) fields[key] = { nullValue: null };
  }
  return fields;
}

async function setFirestoreDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const url = `${FIRESTORE_HOST}/v1/projects/${PROJECT}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      // "owner" is the emulator-only bypass token that skips security rules
      "Authorization": "Bearer owner",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`setFirestoreDoc(${collection}/${docId}) failed: ${body}`);
  }
}

// ── Seed ────────────────────────────────────────────────────

async function seedUser(
  email: string,
  password: string,
  firestoreData: Record<string, unknown>
): Promise<void> {
  const uid = await createAuthUser(email, password);
  await setFirestoreDoc("users", uid, firestoreData);
  const action = uid ? "✅ Created" : "♻️  Updated";
  console.log(`${action}: ${email} (uid: ${uid})`);
}

async function seed() {
  console.log("🌱 Seeding Firebase emulators...\n");

  await seedUser("superadmin@gmail.com", TEST_PASSWORD, {
    name: "Superadmin",
    email: "superadmin@gmail.com",
    role: "superadmin",
  });

  await seedUser("admin.blayag@gmail.com", TEST_PASSWORD, {
    name: "Admin Blayag",
    email: "admin.blayag@gmail.com",
    role: "admin",
    merchant: MERCHANT_ID,
  });

  await seedUser("supervisor.blayag@gmail.com", TEST_PASSWORD, {
    name: "Supervisor Blayag",
    email: "supervisor.blayag@gmail.com",
    role: "supervisor",
    merchant: MERCHANT_ID,
  });

  // User with unrecognized role — AuthContext must sign them out
  await seedUser("unknown.role@gmail.com", TEST_PASSWORD, {
    name: "Unknown Role",
    email: "unknown.role@gmail.com",
    role: "cashier",
  });

  // Merchant document
  await setFirestoreDoc("merchants", MERCHANT_ID, { name: "Blayag Dek Ani" });
  console.log(`✅ Created merchant: ${MERCHANT_ID}`);

  console.log("\n✅ Seeding complete.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
