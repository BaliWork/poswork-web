import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useMerchants } from "@/hooks/useMerchants";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import ExpenseTable from "@/components/expenses/ExpenseTable";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseDeleteDialog from "@/components/expenses/ExpenseDeleteDialog";
import type { Expense, ExpenseFormValues } from "@/types";

export default function ExpensesPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const { data: merchants } = useMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(
    user?.merchant || ""
  );
  const activeMerchant = isSuperadmin ? selectedMerchant : user?.merchant || "";
  const { data: expenses, loading } = useExpenses(activeMerchant || null);

  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  function handleAdd() {
    setEditExpense(null);
    setFormOpen(true);
  }

  function handleEdit(expense: Expense) {
    setEditExpense(expense);
    setFormOpen(true);
  }

  async function handleSubmit(data: ExpenseFormValues) {
    if (!activeMerchant) throw new Error("Merchant belum dipilih.");

    if (editExpense) {
      await updateDoc(
        doc(db, "merchants", activeMerchant, "expenses", editExpense.id),
        {
          description: data.description,
          category: data.category,
          amount: data.amount,
          date: data.date,
          note: data.note ?? null,
        }
      );
    } else {
      await addDoc(
        collection(db, "merchants", activeMerchant, "expenses"),
        {
          description: data.description,
          category: data.category,
          amount: data.amount,
          date: data.date,
          note: data.note ?? null,
          createdAt: serverTimestamp(),
        }
      );
    }
  }

  async function handleDelete(expenseId: string) {
    if (!activeMerchant) return;
    await deleteDoc(
      doc(db, "merchants", activeMerchant, "expenses", expenseId)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Pengeluaran</h1>
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
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {!activeMerchant ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Pilih merchant terlebih dahulu.
        </div>
      ) : (
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeleteExpense}
        />
      )}

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editExpense}
        onSubmit={handleSubmit}
      />
      <ExpenseDeleteDialog
        open={deleteExpense !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteExpense(null);
        }}
        expense={deleteExpense}
        onConfirm={handleDelete}
      />
    </div>
  );
}
