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
import { Plus, X } from "lucide-react";
import type { Product } from "@/types";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (data: {
    name: string;
    category: string;
    price: number;
    prices: number[];
  }) => Promise<void>;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormProps) {
  const isEdit = product !== null;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [prices, setPrices] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setPrices(product.prices.map(String));
    } else {
      setName("");
      setCategory("");
      setPrice("");
      setPrices([""]);
    }
    setError(null);
  }, [product, open]);

  function handlePriceChange(index: number, value: string) {
    const updated = [...prices];
    updated[index] = value;
    setPrices(updated);
  }

  function addPriceRow() {
    setPrices([...prices, ""]);
  }

  function removePriceRow(index: number) {
    setPrices(prices.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !price.trim()) {
      setError("Nama, kategori, dan harga wajib diisi.");
      return;
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Harga harus berupa angka yang valid.");
      return;
    }
    const pricesNum = prices
      .filter((p) => p.trim() !== "")
      .map(Number);
    if (pricesNum.some(isNaN)) {
      setError("Semua daftar harga harus berupa angka.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        price: priceNum,
        prices: pricesNum,
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
          <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi produk."
              : "Isi data untuk membuat produk baru."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nama Produk</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama produk"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Kategori</Label>
            <Input
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="contoh: Makanan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Harga Utama (Rp)</Label>
            <Input
              id="product-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="15000"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Daftar Harga (Rp)</Label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={addPriceRow}
              >
                <Plus />
              </Button>
            </div>
            <div className="space-y-2">
              {prices.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={p}
                    onChange={(e) => handlePriceChange(i, e.target.value)}
                    placeholder="10000"
                    min={0}
                  />
                  {prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removePriceRow(i)}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
