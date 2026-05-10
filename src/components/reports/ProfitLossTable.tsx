import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MonthlyBreakdown, ProfitLossSummary } from "@/types";

interface ProfitLossTableProps {
  data: MonthlyBreakdown[];
  yearSummary: ProfitLossSummary;
  loading: boolean;
}

export default function ProfitLossTable({ data, yearSummary, loading }: ProfitLossTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Rincian Bulanan</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bulan</TableHead>
              <TableHead className="text-right">Pemasukan</TableHead>
              <TableHead className="text-right">Pengeluaran</TableHead>
              <TableHead className="text-right">Laba / Rugi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell className="text-right text-green-700 dark:text-green-500">
                  {formatRupiah(row.revenue)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-500">
                  {formatRupiah(row.expenses)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    row.netProfit >= 0
                      ? "text-green-700 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  )}
                >
                  {formatRupiah(row.netProfit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* Total row */}
          <tfoot>
            <TableRow className="border-t-2 font-bold bg-muted/50">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right text-green-700 dark:text-green-500 font-bold">
                {formatRupiah(yearSummary.totalRevenue)}
              </TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-500 font-bold">
                {formatRupiah(yearSummary.totalExpenses)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-bold",
                  yearSummary.isProfit
                    ? "text-green-700 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                )}
              >
                {formatRupiah(yearSummary.netProfit)}
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
      </CardContent>
    </Card>
  );
}
