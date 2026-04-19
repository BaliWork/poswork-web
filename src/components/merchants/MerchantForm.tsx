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
import type { Merchant } from "@/types";

interface MerchantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
  onSubmit: (data: { id: string; name: string }) => Promise<void>;
}

export default function MerchantForm({
  open,
  onOpenChange,
  merchant,
  onSubmit,
}: MerchantFormProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = merchant !== null;

  useEffect(() => {
    if (merchant) {
      setId(merchant.id);
      setName(merchant.name);
    } else {
      setId("");
      setName("");
    }
    setError(null);
  }, [merchant, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id.trim() || !name.trim()) {
      setError("ID dan nama wajib diisi.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ id: id.trim(), name: name.trim() });
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
          <DialogTitle>{isEdit ? "Edit Merchant" : "Tambah Merchant"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi merchant."
              : "Isi data untuk membuat merchant baru."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchant-id">ID Merchant</Label>
            <Input
              id="merchant-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="contoh: blayag-dek-ani"
              disabled={isEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-name">Nama Merchant</Label>
            <Input
              id="merchant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Blayag Dek Ani"
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
