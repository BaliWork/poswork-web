import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { ProfitLossSummary } from "@/types";

interface ProfitLossSummaryCardsProps {
  summary: ProfitLossSummary;
  loading: boolean;
}

export default function ProfitLossSummaryCards({ summary, loading }: ProfitLossSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Pemasukan",
      value: formatRupiah(summary.totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Pengeluaran",
      value: formatRupiah(summary.totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      title: summary.isProfit ? "Laba Bersih" : "Rugi Bersih",
      value: formatRupiah(summary.netProfit),
      icon: Wallet,
      color: summary.isProfit ? "text-green-600" : "text-red-600",
      bg: summary.isProfit
        ? "bg-green-50 dark:bg-green-950"
        : "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
