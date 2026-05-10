import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Expense, ExpenseFormValues } from "@/types";

const EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Operasional",
  "Gaji & Upah",
  "Peralatan",
  "Utilitas (Listrik, Air, Gas)",
  "Pemasaran",
  "Lain-lain",
];

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onSubmit: (data: ExpenseFormValues) => Promise<void>;
}

export default function ExpenseForm({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: ExpenseFormProps) {
  const isEdit = expense !== null;

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setCategory(expense.category);
      setAmount(String(expense.amount));
      setDate(expense.date);
      setNote(expense.note ?? "");
    } else {
      setDescription("");
      setCategory("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
    setError(null);
  }, [expense, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !category || !amount.trim() || !date) {
      setError("Deskripsi, kategori, jumlah, dan tanggal wajib diisi.");
      return;
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 0 || !Number.isInteger(amountNum)) {
      setError("Jumlah harus berupa bilangan bulat positif.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        description: description.trim(),
        category,
        amount: amountNum,
        date,
        note: note.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data pengeluaran."
              : "Isi data untuk mencatat pengeluaran baru."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-description">Deskripsi</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pembelian bahan baku"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">Kategori</Label>
            <Select value={category} onValueChange={(v) => { if (v !== null) setCategory(v); }}>
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Jumlah (Rp)</Label>
            <Input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150000"
              min={0}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Tanggal</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-note">Catatan (opsional)</Label>
            <Textarea
              id="expense-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beli beras 10kg dari pasar"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
