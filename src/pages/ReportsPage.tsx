import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMerchants } from "@/hooks/useMerchants";
import { useProfitLoss } from "@/hooks/useProfitLoss";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProfitLossSummaryCards from "@/components/reports/ProfitLossSummaryCards";
import ProfitLossChart from "@/components/reports/ProfitLossChart";
import ProfitLossTable from "@/components/reports/ProfitLossTable";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function ReportsPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const { data: merchants } = useMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(
    user?.merchant || ""
  );
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  const activeMerchant = isSuperadmin ? selectedMerchant : (user?.merchant ?? "");

  const { monthlySummaries, yearSummary, loading, error } = useProfitLoss(
    activeMerchant || null,
    selectedYear
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Laporan Laba Rugi</h1>
        <div className="flex flex-wrap items-end gap-3">
          {isSuperadmin && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Merchant</Label>
              <Select
                value={selectedMerchant}
                onValueChange={(v) => setSelectedMerchant(v ?? "")}
              >
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
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tahun</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content: requires a merchant to be selected */}
      {!activeMerchant && isSuperadmin ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
          Pilih merchant untuk melihat laporan.
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <ProfitLossSummaryCards summary={yearSummary} loading={loading} />
          <ProfitLossChart data={monthlySummaries} loading={loading} />
          <ProfitLossTable
            data={monthlySummaries}
            yearSummary={yearSummary}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
