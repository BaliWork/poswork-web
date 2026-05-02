import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Expense } from "@/types";

export function useExpenses(merchantId: string | null) {
  const [data, setData] = useState<Expense[]>([]);
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
      collection(db, "merchants", merchantId, "expenses"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setData(expenses);
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
