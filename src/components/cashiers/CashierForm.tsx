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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { Cashier, CashierFormValues } from "@/types";

interface CashierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashier: Cashier | null;
  existingPins: string[];
  onSubmit: (data: CashierFormValues & { pin: string }) => Promise<void>;
}

export default function CashierForm({
  open,
  onOpenChange,
  cashier,
  existingPins,
  onSubmit,
}: CashierFormProps) {
  const isEdit = cashier !== null;

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cashier) {
      setName(cashier.name);
      setPin(""); // PIN cannot be changed; keep blank
    } else {
      setName("");
      setPin("");
    }
    setError(null);
  }, [cashier, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kasir wajib diisi.");
      return;
    }

    if (!isEdit) {
      if (pin.length !== 4) {
        setError("PIN harus 4 digit.");
        return;
      }
      if (existingPins.includes(pin)) {
        setError("PIN sudah digunakan oleh kasir lain.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), pin });
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Nama Kasir" : "Tambah Kasir"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ubah nama kasir. PIN tidak dapat diubah — hapus dan buat ulang jika perlu."
              : "Masukkan nama dan PIN 4 digit yang unik untuk kasir ini."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cashier-name">Nama</Label>
            <Input
              id="cashier-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kasir"
              autoComplete="off"
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>PIN (4 digit)</Label>
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(value) => setPin(value)}
                inputMode="numeric"
                pattern="[0-9]*"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">
                PIN digunakan kasir untuk login di aplikasi mobile.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
