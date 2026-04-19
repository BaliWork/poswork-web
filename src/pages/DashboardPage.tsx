import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSales } from "@/hooks/useSales";
import { useMerchants } from "@/hooks/useMerchants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, Store } from "lucide-react";
import type { Sale } from "@/types";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function computeMetrics(sales: Sale[]) {
  const allOrders = sales.flatMap((s) => s.orders || []);
  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_payment, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  return { totalRevenue, totalOrders, avgOrderValue };
}

function computeChartData(sales: Sale[]) {
  const revenueByDate = new Map<string, number>();
  for (const sale of sales) {
    const paidOrders = (sale.orders || []).filter((o) => o.status === "PAID");
    const dailyRevenue = paidOrders.reduce((s, o) => s + o.total_payment, 0);
    revenueByDate.set(sale.id, (revenueByDate.get(sale.id) || 0) + dailyRevenue);
  }
  return Array.from(revenueByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}

function SuperadminDashboard() {
  const { data: merchants, loading: merchantsLoading } = useMerchants();
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);

  useEffect(() => {
    if (merchantsLoading || merchants.length === 0) {
      setSalesLoading(false);
      return;
    }

    setSalesLoading(true);
    const unsubscribes: (() => void)[] = [];
    const salesMap = new Map<string, Sale[]>();
    let loadedCount = 0;

    for (const m of merchants) {
      const unsub = onSnapshot(
        collection(db, "merchants", m.id, "sales"),
        (snapshot) => {
          const sales = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Sale[];
          salesMap.set(m.id, sales);
          loadedCount++;
          if (loadedCount >= merchants.length) {
            setAllSales(Array.from(salesMap.values()).flat());
            setSalesLoading(false);
          }
        }
      );
      unsubscribes.push(unsub);
    }

    return () => unsubscribes.forEach((u) => u());
  }, [merchants, merchantsLoading]);

  const loading = merchantsLoading || salesLoading;
  const { totalRevenue, totalOrders, avgOrderValue } = computeMetrics(allSales);
  const chartData = computeChartData(allSales);

  return (
    <DashboardContent
      loading={loading}
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      avgOrderValue={avgOrderValue}
      chartData={chartData}
      merchantCount={merchants.length}
    />
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const { data: sales, loading } = useSales(user?.merchant || null);

  const { totalRevenue, totalOrders, avgOrderValue } = computeMetrics(sales);
  const chartData = computeChartData(sales);

  return (
    <DashboardContent
      loading={loading}
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      avgOrderValue={avgOrderValue}
      chartData={chartData}
    />
  );
}

interface DashboardContentProps {
  loading: boolean;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  chartData: { date: string; revenue: number }[];
  merchantCount?: number;
}

function DashboardContent({
  loading,
  totalRevenue,
  totalOrders,
  avgOrderValue,
  chartData,
  merchantCount,
}: DashboardContentProps) {
  const cards = [
    { title: "Total Pendapatan", value: formatRupiah(totalRevenue), icon: DollarSign },
    { title: "Total Pesanan", value: totalOrders.toLocaleString("id-ID"), icon: ShoppingCart },
    { title: "Rata-rata Pesanan", value: formatRupiah(Math.round(avgOrderValue)), icon: TrendingUp },
    ...(merchantCount !== undefined
      ? [{ title: "Total Merchant", value: String(merchantCount), icon: Store }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: cards.length }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))
          : cards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tren Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Belum ada data penjualan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)
                  }
                />
                <Tooltip
                  formatter={(value) => [formatRupiah(Number(value)), "Pendapatan"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "superadmin") {
    return <SuperadminDashboard />;
  }

  return <AdminDashboard />;
}
