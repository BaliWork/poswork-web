import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

export function useUsers() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const usersRef = collection(db, "users");

    const q =
      currentUser.role === "superadmin"
        ? usersRef
        : query(
            usersRef,
            where("merchant", "==", currentUser.merchant),
            where("role", "==", "cashier")
          );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setData(users);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { data, loading, error };
}
