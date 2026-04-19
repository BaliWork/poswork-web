import { describe, it, expect } from "vitest";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * Verification test — confirms that each test user's Firestore document
 * uses their Firebase Auth UID as the document ID.
 *
 * Prerequisites:
 *   1. Run `npm run test:seed` first to seed Firestore with initial data.
 *   2. Manually update the Firestore documents to use real Firebase Auth UIDs
 *      (or re-seed using createUser() so Auth and Firestore are in sync).
 *   3. Set TEST_SUPERADMIN_PASSWORD, TEST_ADMIN_PASSWORD, TEST_CASHIER_PASSWORD
 *      in your .env file.
 *
 * Run: npm run test:verify
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, "verify-auth-uid-test");
const auth = getAuth(app);
const db = getFirestore(app);

// ── Test credentials (must be valid Firebase Auth accounts) ──

const testUsers = [
  {
    email: import.meta.env.VITE_TEST_SUPERADMIN_EMAIL ?? "superadmin@gmail.com",
    password: import.meta.env.VITE_TEST_SUPERADMIN_PASSWORD,
    expectedRole: "superadmin",
    label: "superadmin",
  },
  {
    email: import.meta.env.VITE_TEST_ADMIN_EMAIL ?? "admin.blayag@gmail.com",
    password: import.meta.env.VITE_TEST_ADMIN_PASSWORD,
    expectedRole: "admin",
    label: "admin merchant",
  },
  {
    email: import.meta.env.VITE_TEST_CASHIER_EMAIL ?? "kasir1.blayag@gmail.com",
    password: import.meta.env.VITE_TEST_CASHIER_PASSWORD,
    expectedRole: "cashier",
    label: "cashier",
  },
];

// ── Helpers ─────────────────────────────────────────────────

async function signInAndGetUid(email: string, password: string): Promise<string> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await signOut(auth);
  return credential.user.uid;
}

// ── Tests ────────────────────────────────────────────────────

describe("Verify user Firestore documents use auth.uid as document ID", () => {
  for (const user of testUsers) {
    it(`${user.label}: Firestore doc ID should match auth.uid`, async () => {
      if (!user.password) {
        throw new Error(
          `Missing password for ${user.label}. ` +
          `Set VITE_TEST_${user.label.toUpperCase().replace(" ", "_")}_PASSWORD in .env`
        );
      }

      const uid = await signInAndGetUid(user.email, user.password);

      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      expect(
        userDocSnap.exists(),
        `Firestore document users/${uid} does not exist for ${user.label} (${user.email}). ` +
        `Make sure to create the document with auth.uid as the ID.`
      ).toBe(true);

      const data = userDocSnap.data()!;

      expect(data.email).toBe(user.email);
      expect(data.role).toBe(user.expectedRole);
    });
  }
});
