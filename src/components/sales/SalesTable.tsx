import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sale } from "@/types";

interface SalesTableProps {
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

function statusBadgeVariant(status: string) {
  switch (status) {
    case "PAID":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    case "CANCELLED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function SalesTable({ sales, loading }: SalesTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const allOrders = sales
    .flatMap((s) =>
      (s.orders || []).map((order) => ({
        ...order,
        saleDate: s.id,
      }))
    )
    .sort((a, b) => {
      const dateCompare = b.saleDate.localeCompare(a.saleDate);
      if (dateCompare !== 0) return dateCompare;
      return b.counter - a.counter;
    });

  if (allOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Belum ada transaksi.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>No. Order</TableHead>
          <TableHead>Pelanggan</TableHead>
          <TableHead>Pembayaran</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allOrders.map((order) => (
          <TableRow key={`${order.saleDate}-${order.id}`}>
            <TableCell>{order.saleDate}</TableCell>
            <TableCell className="font-mono text-xs">
              {order.order_number}
            </TableCell>
            <TableCell>{order.customer_name || "—"}</TableCell>
            <TableCell>{order.payment_type}</TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatRupiah(order.total_payment)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
