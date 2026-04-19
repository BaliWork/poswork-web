import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMerchants } from "@/hooks/useMerchants";
import { useSales } from "@/hooks/useSales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SalesSummaryCards from "@/components/sales/SalesSummaryCards";
import SalesChart from "@/components/sales/SalesChart";
import SalesTable from "@/components/sales/SalesTable";

export default function SalesPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const { data: merchants } = useMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(
    user?.merchant || ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeMerchant = isSuperadmin ? selectedMerchant : user?.merchant || "";
  const { data: sales, loading } = useSales(activeMerchant || null);

  const filteredSales = useMemo(() => {
    if (!startDate && !endDate) return sales;
    return sales.filter((s) => {
      if (startDate && s.id < startDate) return false;
      if (endDate && s.id > endDate) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  function clearDateFilter() {
    setStartDate("");
    setEndDate("");
  }

  const hasDateFilter = startDate || endDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Penjualan</h1>
        {isSuperadmin && (
          <Select value={selectedMerchant} onValueChange={(v) => setSelectedMerchant(v ?? "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih merchant" />
            </SelectTrigger>
            <SelectContent>
              {merchants.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Date range filter */}
      {activeMerchant && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          {hasDateFilter && (
            <Button variant="ghost" size="sm" onClick={clearDateFilter}>
              <X className="mr-1 size-3" />
              Reset
            </Button>
          )}
        </div>
      )}

      {!activeMerchant ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Pilih merchant terlebih dahulu.
        </div>
      ) : (
        <>
          <SalesSummaryCards sales={filteredSales} loading={loading} />
          <SalesChart sales={filteredSales} loading={loading} />
          <div>
            <h2 className="mb-4 text-lg font-semibold">Detail Transaksi</h2>
            <SalesTable sales={filteredSales} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
