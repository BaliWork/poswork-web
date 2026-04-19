import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMerchants } from "@/hooks/useMerchants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MerchantTable from "@/components/merchants/MerchantTable";
import MerchantForm from "@/components/merchants/MerchantForm";
import MerchantDeleteDialog from "@/components/merchants/MerchantDeleteDialog";
import type { Merchant } from "@/types";

export default function MerchantsPage() {
  const { data: merchants, loading } = useMerchants();
  const [formOpen, setFormOpen] = useState(false);
  const [editMerchant, setEditMerchant] = useState<Merchant | null>(null);
  const [deleteMerchant, setDeleteMerchant] = useState<Merchant | null>(null);

  function handleAdd() {
    setEditMerchant(null);
    setFormOpen(true);
  }

  function handleEdit(merchant: Merchant) {
    setEditMerchant(merchant);
    setFormOpen(true);
  }

  async function handleSubmit(data: { id: string; name: string }) {
    await setDoc(doc(db, "merchants", data.id), { name: data.name });
  }

  async function handleDelete(merchantId: string) {
    await deleteDoc(doc(db, "merchants", merchantId));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Merchants</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-1 size-4" />
          Tambah
        </Button>
      </div>
      <MerchantTable
        merchants={merchants}
        loading={loading}
        onEdit={handleEdit}
        onDelete={setDeleteMerchant}
      />
      <MerchantForm
        open={formOpen}
        onOpenChange={setFormOpen}
        merchant={editMerchant}
        onSubmit={handleSubmit}
      />
      <MerchantDeleteDialog
        open={deleteMerchant !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteMerchant(null);
        }}
        merchant={deleteMerchant}
        onConfirm={handleDelete}
      />
    </div>
  );
}
