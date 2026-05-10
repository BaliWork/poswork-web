import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Cashier } from "@/types";

export function useCashiers(merchantId: string | null) {
  const [data, setData] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "merchants", merchantId, "cashiers"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cashiers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Cashier[];
        setData(cashiers);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  return { data, loading, error };
}

