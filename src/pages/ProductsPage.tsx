import { useState } from "react";
import { doc, setDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useMerchants } from "@/hooks/useMerchants";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import ProductTable from "@/components/products/ProductTable";
import ProductForm from "@/components/products/ProductForm";
import ProductDeleteDialog from "@/components/products/ProductDeleteDialog";
import type { Product } from "@/types";

export default function ProductsPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const { data: merchants } = useMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState<string>(
    user?.merchant || ""
  );
  const activeMerchant = isSuperadmin ? selectedMerchant : user?.merchant || "";
  const { data: products, loading } = useProducts(activeMerchant || null);

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  function handleAdd() {
    setEditProduct(null);
    setFormOpen(true);
  }

  function handleEdit(product: Product) {
    setEditProduct(product);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    name: string;
    category: string;
    price: number;
    prices: number[];
  }) {
    if (!activeMerchant) throw new Error("Merchant belum dipilih.");

    if (editProduct) {
      await updateDoc(
        doc(db, "merchants", activeMerchant, "products", editProduct.id),
        data
      );
    } else {
      const newDocRef = doc(collection(db, "merchants", activeMerchant, "products"));
      await setDoc(newDocRef, data);
    }
  }

  async function handleDelete(productId: string) {
    if (!activeMerchant) return;
    await deleteDoc(
      doc(db, "merchants", activeMerchant, "products", productId)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Produk</h1>
        <div className="flex items-center gap-2">
          {isSuperadmin && (
            <div className="flex items-center gap-1">
              <Select value={selectedMerchant} onValueChange={(v) => setSelectedMerchant(v ?? "")}>
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
            Tambah
          </Button>
        </div>
      </div>

      {!activeMerchant ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Pilih merchant terlebih dahulu.
        </div>
      ) : (
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeleteProduct}
        />
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSubmit={handleSubmit}
      />
      <ProductDeleteDialog
        open={deleteProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null);
        }}
        product={deleteProduct}
        onConfirm={handleDelete}
      />
    </div>
  );
}
