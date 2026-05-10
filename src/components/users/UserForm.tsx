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
import { useAuth } from "@/context/AuthContext";
import type { User, UserRole, Merchant } from "@/types";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  merchants: Merchant[];
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    merchant?: string;
  }) => Promise<void>;
}

export default function UserForm({
  open,
  onOpenChange,
  user,
  merchants,
  onSubmit,
}: UserFormProps) {
  const { user: currentUser } = useAuth();
  const isEdit = user !== null;
  const isSuperadmin = currentUser?.role === "superadmin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("supervisor");
  const [merchant, setMerchant] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
      setMerchant(user.merchant || "");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole(isSuperadmin ? "admin" : "supervisor");
      setMerchant(currentUser?.merchant || "");
    }
    setError(null);
  }, [user, open, isSuperadmin, currentUser?.merchant]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    if (!isEdit && !password.trim()) {
      setError("Password wajib diisi untuk pengguna baru.");
      return;
    }
    if (role !== "superadmin" && !merchant) {
      setError("Merchant wajib dipilih.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        role,
        merchant: role === "superadmin" ? undefined : merchant,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleOptions: { value: UserRole; label: string }[] = isSuperadmin
    ? [
        { value: "superadmin", label: "Superadmin" },
        { value: "admin", label: "Admin Merchant" },
        { value: "supervisor", label: "Supervisor" },
      ]
    : [{ value: "supervisor", label: "Supervisor" }];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi pengguna."
              : "Isi data untuk membuat pengguna baru."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nama</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama pengguna"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role !== "superadmin" && (
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Select
                value={merchant}
                onValueChange={(v) => setMerchant(v ?? "")}
                disabled={!isSuperadmin}
              >
                <SelectTrigger className="w-full">
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
