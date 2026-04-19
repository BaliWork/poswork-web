import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Merchant } from "@/types";

export function useMerchants() {
  const [data, setData] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "merchants"),
      (snapshot) => {
        const merchants = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Merchant[];
        setData(merchants);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
}
