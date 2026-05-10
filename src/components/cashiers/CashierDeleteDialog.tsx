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
import type { Cashier } from "@/types";

interface CashierDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashier: Cashier | null;
  onConfirm: (cashierId: string) => Promise<void>;
}

export default function CashierDeleteDialog({
  open,
  onOpenChange,
  cashier,
  onConfirm,
}: CashierDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!cashier) return;
    setDeleting(true);
    try {
      await onConfirm(cashier.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Kasir</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus kasir{" "}
            <strong>{cashier?.name}</strong>? Tindakan ini tidak dapat
            dibatalkan dan kasir tidak akan bisa login ke aplikasi mobile.
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
