import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sale, Order } from "@/types";

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
}

type OrderRow = Order & { saleDate: string };

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

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "saleDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tanggal
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
  },
  {
    accessorKey: "order_number",
    header: "No. Order",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("order_number")}</span>
    ),
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pelanggan
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("customer_name") || "—",
  },
  {
    accessorKey: "payment_type",
    header: "Pembayaran",
    cell: ({ row }) => {
      const type = row.getValue("payment_type") as string;
      return (
        <Badge variant="outline">{type}</Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={statusBadgeVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "total_payment",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatRupiah(row.getValue("total_payment"))}
      </div>
    ),
  },
];

export default function SalesTable({ sales, loading }: SalesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const allOrders = useMemo<OrderRow[]>(() => {
    return sales
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
  }, [sales]);

  const table = useReactTable({
    data: allOrders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Belum ada transaksi.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari pelanggan..."
          value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customer_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} transaksi
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
