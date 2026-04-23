import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserRole = "superadmin" | "admin" | "cashier";

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  merchant?: string;
}

interface AuthContextValue {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === "cashier") {
              await signOut(auth);
              setUser(null);
              setError("Akun kasir tidak dapat mengakses aplikasi web ini.");
              setLoading(false);
              return;
            }
            setUser({
              uid: firebaseUser.uid,
              name: data.name,
              email: data.email,
              role: data.role,
              merchant: data.merchant,
            });
            setError(null);
          } else {
            await signOut(auth);
            setUser(null);
            setError("Data pengguna tidak ditemukan.");
          }
        } catch {
          await signOut(auth);
          setUser(null);
          setError("Gagal memuat data pengguna.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      switch (code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Email atau password salah.");
          break;
        case "auth/too-many-requests":
          setError("Terlalu banyak percobaan. Silakan coba lagi nanti.");
          break;
        default:
          setError("Terjadi kesalahan saat login.");
      }
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
