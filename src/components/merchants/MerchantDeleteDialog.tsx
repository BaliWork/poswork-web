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
import type { Merchant } from "@/types";

interface MerchantDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
  onConfirm: (merchantId: string) => Promise<void>;
}

export default function MerchantDeleteDialog({
  open,
  onOpenChange,
  merchant,
  onConfirm,
}: MerchantDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!merchant) return;
    setDeleting(true);
    try {
      await onConfirm(merchant.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Merchant</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus merchant{" "}
            <strong>{merchant?.name}</strong>? Tindakan ini tidak dapat
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
