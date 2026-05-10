import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import type { MonthlyBreakdown } from "@/types";

interface ProfitLossChartProps {
  data: MonthlyBreakdown[];
  loading: boolean;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default function ProfitLossChart({ data, loading }: ProfitLossChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, i) => ({
    month: SHORT_MONTHS[i],
    Pemasukan: item.revenue,
    Pengeluaran: item.expenses,
    "Laba/Rugi": item.netProfit,
  }));

  const hasData = data.some((d) => d.revenue > 0 || d.expenses > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Grafik Pemasukan vs Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Belum ada data untuk tahun ini.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(0)}jt`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(0)}rb`
                    : String(v)
                }
              />
              <Tooltip
                formatter={(value, name) => [formatRupiah(value as number), name as string]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: 600 }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="Pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
