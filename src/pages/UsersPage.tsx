import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createUser } from "@/lib/createUser";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useMerchants } from "@/hooks/useMerchants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserTable from "@/components/users/UserTable";
import UserForm from "@/components/users/UserForm";
import UserDeleteDialog from "@/components/users/UserDeleteDialog";
import type { User, UserRole } from "@/types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, loading } = useUsers();
  const { data: merchants } = useMerchants();
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const isAdmin = currentUser?.role === "admin";
  const hasSupervisor = isAdmin && users.some((u) => u.role === "supervisor");

  function handleAdd() {
    setEditUser(null);
    setFormOpen(true);
  }

  function handleEdit(user: User) {
    setEditUser(user);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    merchant?: string;
  }) {
    if (editUser) {
      const updateData: Record<string, unknown> = {
        name: data.name,
        role: data.role,
      };
      if (data.merchant) updateData.merchant = data.merchant;
      await updateDoc(doc(db, "users", editUser.id), updateData);
    } else {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password!,
        role: data.role,
        merchant: data.merchant,
      });
    }
  }

  async function handleDelete(userId: string) {
    await deleteDoc(doc(db, "users", userId));
  }

  const pageTitle =
    currentUser?.role === "superadmin" ? "Semua Pengguna" : "Pengguna";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{pageTitle}</h1>
        {hasSupervisor ? (
          <p className="text-sm text-muted-foreground">Supervisor sudah ada.</p>
        ) : (
          <Button onClick={handleAdd}>
            <Plus className="mr-1 size-4" />
            Tambah
          </Button>
        )}
      </div>
      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={setDeleteUser}
      />
      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editUser}
        merchants={merchants}
        onSubmit={handleSubmit}
      />
      <UserDeleteDialog
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
        user={deleteUser}
        onConfirm={handleDelete}
      />
    </div>
  );
}
