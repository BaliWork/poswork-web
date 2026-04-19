import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import type { Sale } from "@/types";

interface SalesSummaryCardsProps {
  sales: Sale[];
  loading: boolean;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function SalesSummaryCards({ sales, loading }: SalesSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const allOrders = sales.flatMap((s) => s.orders || []);
  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_payment, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const cards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Total Pesanan",
      value: totalOrders.toLocaleString("id-ID"),
      icon: ShoppingCart,
    },
    {
      title: "Rata-rata Pesanan",
      value: formatRupiah(Math.round(avgOrderValue)),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
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
  );
}
