import { useState } from "react";
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCashiers } from "@/hooks/useCashiers";
import { useMerchants } from "@/hooks/useMerchants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import CashierTable from "@/components/cashiers/CashierTable";
import CashierForm from "@/components/cashiers/CashierForm";
import CashierDeleteDialog from "@/components/cashiers/CashierDeleteDialog";
import type { Cashier } from "@/types";

export default function CashiersPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const { data: merchants } = useMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(
    user?.merchant || ""
  );
  const activeMerchant = isSuperadmin ? selectedMerchant : user?.merchant || "";
  const { data: cashiers, loading } = useCashiers(activeMerchant || null);

  const [formOpen, setFormOpen] = useState(false);
  const [editCashier, setEditCashier] = useState<Cashier | null>(null);
  const [deleteCashier, setDeleteCashier] = useState<Cashier | null>(null);

  function handleAdd() {
    setEditCashier(null);
    setFormOpen(true);
  }

  function handleEdit(cashier: Cashier) {
    setEditCashier(cashier);
    setFormOpen(true);
  }

  async function handleSubmit(data: { name: string; pin: string }) {
    if (!activeMerchant) throw new Error("Merchant belum dipilih.");

    if (editCashier) {
      // Edit only updates name (PIN is document ID, cannot change)
      await updateDoc(
        doc(db, "merchants", activeMerchant, "cashiers", editCashier.id),
        {
          name: data.name,
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      );
    } else {
      // New cashier: PIN is used as document ID
      await setDoc(
        doc(db, "merchants", activeMerchant, "cashiers", data.pin),
        {
          name: data.name,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: null,
        }
      );
    }
  }

  async function handleDelete(cashierId: string) {
    if (!activeMerchant) return;
    await deleteDoc(
      doc(db, "merchants", activeMerchant, "cashiers", cashierId)
    );
  }

  const existingPins = cashiers.map((c) => c.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Kasir</h1>
        <div className="flex items-center gap-2">
          {isSuperadmin && (
            <div className="flex items-center gap-1">
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
              {selectedMerchant && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedMerchant("")}
                  aria-label="Hapus pilihan merchant"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          )}
          <Button onClick={handleAdd} disabled={!activeMerchant}>
            <Plus className="mr-1 size-4" />
            Tambah Kasir
          </Button>
        </div>
      </div>

      {!activeMerchant ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Pilih merchant terlebih dahulu.
        </div>
      ) : (
        <CashierTable
          cashiers={cashiers}
          loading={loading}
          onDelete={setDeleteCashier}
        />
      )}

      <CashierForm
        open={formOpen}
        onOpenChange={setFormOpen}
        cashier={editCashier}
        existingPins={existingPins}
        onSubmit={handleSubmit}
      />
      <CashierDeleteDialog
        open={deleteCashier !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCashier(null);
        }}
        cashier={deleteCashier}
        onConfirm={handleDelete}
      />
    </div>
  );
}
