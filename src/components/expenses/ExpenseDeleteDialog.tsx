import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types";

interface ExpenseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm: (expenseId: string) => Promise<void>;
}

export default function ExpenseDeleteDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
}: ExpenseDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!expense) return;
    setDeleting(true);
    try {
      await onConfirm(expense.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Pengeluaran</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengeluaran{" "}
            <strong>{expense?.description}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
