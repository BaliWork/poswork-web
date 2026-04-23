import { useState, type FormEvent } from "react";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, error, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateForm(): boolean {
    if (!email.trim() || !password.trim()) {
      setValidationError("Email dan password wajib diisi.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Format email tidak valid.");
      return false;
    }
    setValidationError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    await login(email, password);
    // Navigation is handled by App.tsx route guard when user state changes
  }

  const displayError = validationError || error;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left column — form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" />
            </div>
            POSWork
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              onSubmit={handleSubmit}
              className={cn("flex flex-col gap-6")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Masukkan email dan password untuk melanjutkan
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {displayError && (
                  <p className="text-sm text-destructive">{displayError}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right column — cover image */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&q=80"
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
