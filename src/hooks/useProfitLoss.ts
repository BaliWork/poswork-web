import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale, Expense, MonthlyBreakdown, ProfitLossSummary } from "@/types";

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface UseProfitLossResult {
  monthlySummaries: MonthlyBreakdown[];
  yearSummary: ProfitLossSummary;
  loading: boolean;
  error: string | null;
}

function buildEmptySummary(year: number): ProfitLossSummary {
  return { period: String(year), totalRevenue: 0, totalExpenses: 0, netProfit: 0, isProfit: true };
}

export function useProfitLoss(merchantId: string | null, year: number): UseProfitLossResult {
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyBreakdown[]>([]);
  const [yearSummary, setYearSummary] = useState<ProfitLossSummary>(buildEmptySummary(year));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setMonthlySummaries([]);
      setYearSummary(buildEmptySummary(year));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const yearStr = String(year);

        // Fetch all sales documents and filter by year prefix (doc ID = "YYYY-MM-DD")
        const salesSnap = await getDocs(collection(db, "merchants", merchantId!, "sales"));
        const sales = salesSnap.docs
          .filter((doc) => doc.id.startsWith(yearStr))
          .map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];

        // Fetch all expenses and filter by year prefix (expense.date = "YYYY-MM-DD")
        const expensesSnap = await getDocs(collection(db, "merchants", merchantId!, "expenses"));
        const expenses = expensesSnap.docs
          .filter((doc) => {
            const data = doc.data();
            return typeof data.date === "string" && data.date.startsWith(yearStr);
          })
          .map((doc) => ({ id: doc.id, ...doc.data() })) as Expense[];

        // Initialize monthly buckets keyed by "YYYY-MM"
        const monthlyRevenue: Record<string, number> = {};
        const monthlyExpenses: Record<string, number> = {};
        for (let m = 1; m <= 12; m++) {
          const key = `${yearStr}-${String(m).padStart(2, "0")}`;
          monthlyRevenue[key] = 0;
          monthlyExpenses[key] = 0;
        }

        // Aggregate sales revenue by month (paid orders only)
        for (const sale of sales) {
          const monthKey = sale.id.substring(0, 7); // "YYYY-MM"
          const paidOrders = (sale.orders || []).filter((o) => o.status === "PAID");
          const revenue = paidOrders.reduce((sum, o) => sum + o.total_payment, 0);
          if (monthKey in monthlyRevenue) {
            monthlyRevenue[monthKey] += revenue;
          }
        }

        // Aggregate expenses by month
        for (const expense of expenses) {
          const monthKey = expense.date.substring(0, 7); // "YYYY-MM"
          if (monthKey in monthlyExpenses) {
            monthlyExpenses[monthKey] += expense.amount;
          }
        }

        // Build 12-month breakdown array
        const summaries: MonthlyBreakdown[] = Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const key = `${yearStr}-${String(m).padStart(2, "0")}`;
          const revenue = monthlyRevenue[key] ?? 0;
          const exp = monthlyExpenses[key] ?? 0;
          return {
            month: MONTH_LABELS[i],
            revenue,
            expenses: exp,
            netProfit: revenue - exp,
          };
        });

        // Annual totals
        const totalRevenue = summaries.reduce((s, m) => s + m.revenue, 0);
        const totalExpenses = summaries.reduce((s, m) => s + m.expenses, 0);
        const netProfit = totalRevenue - totalExpenses;

        setMonthlySummaries(summaries);
        setYearSummary({ period: yearStr, totalRevenue, totalExpenses, netProfit, isProfit: netProfit >= 0 });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data laporan.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [merchantId, year]);

  return { monthlySummaries, yearSummary, loading, error };
}
