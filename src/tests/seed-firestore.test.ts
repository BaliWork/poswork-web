import { describe, it, expect } from "vitest";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

/**
 * Seed test — populates Firestore with initial test data.
 *
 * Prerequisites:
 *   1. Create a `.env` file with your Firebase config (see .env.example)
 *   2. Run: npm run test:seed
 *
 * This test creates:
 *   - 1 superadmin user
 *   - 1 admin merchant user
 *   - 1 cashier user
 *   - 1 merchant document
 *   - 2 product documents under the merchant
 *   - 1 sales date document under the merchant
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, "seed-test");
const db = getFirestore(app);
const auth = getAuth(app);

const TEST_PASSWORD = import.meta.env.VITE_TEST_SUPERADMIN_PASSWORD ?? "Test123456!";

// ── Helpers ────────────────────────────────────────────────

/**
 * Create a Firebase Auth user and return its UID.
 * If the user already exists, sign in to retrieve the UID instead.
 */
async function getOrCreateAuthUser(email: string, password: string): Promise<string> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth);
    return credential.user.uid;
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "auth/email-already-in-use") {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      return credential.user.uid;
    }
    throw error;
  }
}

// ── Test Data ──────────────────────────────────────────────

const MERCHANT_ID = "blayag-dek-ani";

const superadminUser = {
  name: "Superadmin",
  email: "superadmin@gmail.com",
  role: "superadmin",
};

const adminUser = {
  name: "Admin Blayag",
  email: "admin.blayag@gmail.com",
  role: "admin",
  merchant: MERCHANT_ID,
};

const cashierUser = {
  name: "Kasir 1",
  email: "kasir1.blayag@gmail.com",
  role: "cashier",
  merchant: MERCHANT_ID,
};

const merchant = {
  name: "Blayag Dek Ani",
};

const products = [
  {
    id: "blayag-bungkus",
    name: "Blayag Bungkus",
    category: "Makanan",
    price: 15000,
    prices: [10000, 12000, 12500, 15000],
  },
  {
    id: "es-teh-manis",
    name: "Es Teh Manis",
    category: "Minuman",
    price: 5000,
    prices: [3000, 4000, 5000],
  },
];

const saleDate = "2026-04-19";
const saleDocument = {
  opening_balance: {
    id: "c1d8ed14-cc0c-4cf8-8303-53a6d7aac396",
    balance: 500000,
    created_by: "Kasir Utama",
    date: "2026-04-19T07:58:09.052901",
  },
  closing_balance: {
    cahsier_name: "Kasir Utama 1",
    cashier_balance: 1000000,
    closing_date: "2026-04-19T16:48:14.423981",
    duration: "8 jam 50 menit",
    net_amount: 5797000,
    opening_balance: 500000,
    total_cash: 5015000,
    total_non_cash: 782000,
  },
  orders: [
    {
      counter: 1,
      created_by: "Kasir Utama",
      customer_name: "cs",
      id: "019d9fa8-4904-7c32-98ce-7d6bdfe4e400",
      money_received: 50000,
      order_date: "2026-04-19T08:20:23.735330Z",
      order_details: [
        {
          description: null,
          grand_total: 30000,
          id: "019d9fad-107c-7405-bf61-ded316395cfb",
          order_id: "019d9fa8-4904-7c32-98ce-7d6bdfe4e400",
          product_id: "blayag-bungkus",
          product_name: "Blayag Bungkus",
          quantity: 2,
          sub_total: 30000,
        },
        {
          description: null,
          grand_total: 5000,
          id: "019d9fad-107c-7405-bf61-ded316395cfc",
          order_id: "019d9fa8-4904-7c32-98ce-7d6bdfe4e400",
          product_id: "es-teh-manis",
          product_name: "Es Teh Manis",
          quantity: 1,
          sub_total: 5000,
        },
      ],
      order_number: "BDA-20260419-0001",
      payment_type: "CASH",
      status: "PAID",
      sub_total: 35000,
      total_payment: 35000,
    },
  ],
};

// ── Tests ──────────────────────────────────────────────────

describe("Seed Firestore with test data", () => {
  it("should create superadmin user document with auth.uid", async () => {
    const uid = await getOrCreateAuthUser(superadminUser.email, TEST_PASSWORD);
    const ref = doc(db, "users", uid);
    await setDoc(ref, superadminUser);

    const snapshot = await getDocs(collection(db, "users"));
    const found = snapshot.docs.find((d) => d.id === uid);
    expect(found).toBeDefined();
    expect(found!.data().role).toBe("superadmin");
  });

  it("should create admin merchant user document with auth.uid", async () => {
    const uid = await getOrCreateAuthUser(adminUser.email, TEST_PASSWORD);
    const ref = doc(db, "users", uid);
    await setDoc(ref, adminUser);

    const snapshot = await getDocs(collection(db, "users"));
    const found = snapshot.docs.find((d) => d.id === uid);
    expect(found).toBeDefined();
    expect(found!.data().role).toBe("admin");
    expect(found!.data().merchant).toBe(MERCHANT_ID);
  });

  it("should create cashier user document with auth.uid", async () => {
    const uid = await getOrCreateAuthUser(cashierUser.email, TEST_PASSWORD);
    const ref = doc(db, "users", uid);
    await setDoc(ref, cashierUser);

    const snapshot = await getDocs(collection(db, "users"));
    const found = snapshot.docs.find((d) => d.id === uid);
    expect(found).toBeDefined();
    expect(found!.data().role).toBe("cashier");
    expect(found!.data().merchant).toBe(MERCHANT_ID);
  });

  it("should create merchant document", async () => {
    const ref = doc(db, "merchants", MERCHANT_ID);
    await setDoc(ref, merchant);

    const snapshot = await getDocs(collection(db, "merchants"));
    const found = snapshot.docs.find((d) => d.id === MERCHANT_ID);
    expect(found).toBeDefined();
    expect(found!.data().name).toBe("Blayag Dek Ani");
  });

  it("should create 2 product documents under the merchant", async () => {
    for (const product of products) {
      const { id, ...data } = product;
      const ref = doc(db, "merchants", MERCHANT_ID, "products", id);
      await setDoc(ref, data);
    }

    const snapshot = await getDocs(
      collection(db, "merchants", MERCHANT_ID, "products")
    );
    expect(snapshot.size).toBeGreaterThanOrEqual(2);

    const names = snapshot.docs.map((d) => d.data().name);
    expect(names).toContain("Blayag Bungkus");
    expect(names).toContain("Es Teh Manis");
  });

  it("should create 1 sales date document under the merchant", async () => {
    const ref = doc(db, "merchants", MERCHANT_ID, "sales", saleDate);
    await setDoc(ref, saleDocument);

    const snapshot = await getDocs(
      collection(db, "merchants", MERCHANT_ID, "sales")
    );
    const found = snapshot.docs.find((d) => d.id === saleDate);
    expect(found).toBeDefined();
    expect(found!.data().orders).toHaveLength(1);
    expect(found!.data().opening_balance).toBeDefined();
    expect(found!.data().closing_balance).toBeDefined();
  });
});
