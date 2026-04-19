import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { secondaryAuth, db } from "@/lib/firebase";
import type { UserRole } from "@/types";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  merchant?: string;
}

/**
 * Membuat Firebase Auth user baru menggunakan secondary app instance,
 * lalu langsung membuat Firestore document dengan UID sebagai document ID.
 * Sesi admin yang sedang aktif tidak terpengaruh.
 */
export async function createUser({
  name,
  email,
  password,
  role,
  merchant,
}: CreateUserParams): Promise<string> {
  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    password
  );

  const uid = credential.user.uid;

  const userData: Record<string, unknown> = { name, email, role };
  if (merchant) {
    userData.merchant = merchant;
  }

  await setDoc(doc(db, "users", uid), userData);

  // Logout dari secondary auth agar tidak menyisakan sesi
  await signOut(secondaryAuth);

  return uid;
}
