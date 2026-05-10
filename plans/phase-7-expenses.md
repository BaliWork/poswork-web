# Phase 7 — Expenses (Pengeluaran) Feature

> **Goal:** Implement a full CRUD feature for managing merchant expenses (pengeluaran), scoped per merchant, accessible by Superadmin (all merchants) and Admin Merchant (own merchant only).

---

## Overview

Expenses represent operational costs incurred by a merchant — such as ingredient purchases, equipment, rent, utilities, or other operational costs. Each expense entry is stored as a document in the `merchants/{merchantId}/expenses` subcollection.

---

## Firestore Data Model

### Subcollection: `merchants/{merchantId}/expenses/{expenseId}`

```json
{
  "description": "Pembelian bahan baku",
  "category": "Bahan Baku",
  "amount": 150000,
  "date": "2026-04-19",
  "note": "Beli beras 10kg dari pasar",
  "createdAt": "2026-04-19T08:30:00Z"
}
```

| Field | Type | Description |
|---|---|---|
| `description` | `string` | Short description of the expense |
| `category` | `string` | Expense category (e.g., Bahan Baku, Operasional, Gaji, dll.) |
| `amount` | `number` | Expense amount in rupiah (integer, no decimals) |
| `date` | `string` | Date of expense in `YYYY-MM-DD` format |
| `note` | `string` (optional) | Additional notes |
| `createdAt` | `string` | ISO timestamp of document creation |

### Expense Categories (default)

- Bahan Baku
- Operasional
- Gaji & Upah
- Peralatan
- Utilitas (Listrik, Air, Gas)
- Pemasaran
- Lain-lain

---

## TypeScript Types

Add to `src/types/index.ts`:

```ts
export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export type ExpenseFormValues = Omit<Expense, 'id' | 'createdAt'>;
```

---

## File Structure

```
src/
├── components/
│   └── expenses/
│       ├── ExpenseTable.tsx        # Expense list table with filter by date/category
│       ├── ExpenseForm.tsx         # Add/edit expense form (Dialog)
│       └── ExpenseDeleteDialog.tsx # Confirm delete dialog
├── hooks/
│   └── useExpenses.ts              # Firestore real-time hook for expenses
└── pages/
    └── ExpensesPage.tsx            # Main expenses page
```

---

## Hook: `useExpenses.ts`

```ts
// src/hooks/useExpenses.ts
// Returns: { expenses, loading, error }
// - Scoped to merchantId for admin role
// - Superadmin can pass any merchantId or query all
// - Listens in real-time via onSnapshot
// - Ordered by date descending
```

**Implementation notes:**
- Accept `merchantId` as a parameter
- Use `collection(db, 'merchants', merchantId, 'expenses')`
- Order by `date` descending
- Clean up listener in `useEffect` return

---

## Components

### `ExpenseTable.tsx`
- Columns: Date, Description, Category, Amount, Note, Actions
- Filter: by month/year (date range picker or month selector)
- Filter: by category (Select dropdown)
- Actions: Edit (pencil icon), Delete (trash icon)
- Show total sum of filtered expenses at the bottom of the table

### `ExpenseForm.tsx`
- Triggered via Dialog (Add / Edit mode)
- Fields: Description (Input), Category (Select), Amount (Input number), Date (Input date), Note (Textarea, optional)
- Validation: all required fields except `note`
- On submit: `addDoc` or `updateDoc` to Firestore

### `ExpenseDeleteDialog.tsx`
- Alert dialog confirming deletion
- Shows expense description in the confirmation message
- On confirm: `deleteDoc` from Firestore

---

## Page: `ExpensesPage.tsx`

- **Route:** `/expenses`
- **Accessible by:** Superadmin (all merchants), Admin Merchant (own merchant), Supervisor (own merchant)
- Header with "Tambah Pengeluaran" button
- For Superadmin: merchant selector dropdown to switch between merchants
- Month/year filter to narrow down expense entries
- `ExpenseTable` component with loaded data
- Totals section: total pengeluaran for selected period

---

## Routing

Add to `App.tsx`:

```tsx
<Route path="/expenses" element={
  <RoleGuard allowedRoles={['superadmin', 'admin', 'supervisor']}>
    <ExpensesPage />
  </RoleGuard>
} />
```

---

## Sidebar Navigation

Add "Pengeluaran" menu item to `Sidebar.tsx`:
- Icon: `TrendingDown` (lucide-react)
- Label: Pengeluaran
- Path: `/expenses`
- Visible to: `superadmin`, `admin`, `supervisor`

---

## Firebase Security Rules Update

Already covered in the updated Phase 6 rules (using the `isMemberOfMerchant` helper which includes both admin and supervisor):

```
// expenses subcollection
match /expenses/{expenseId} {
  allow read, write: if isSuperadmin();
  allow read, write: if isMemberOfMerchant(merchantId); // admin + supervisor
}
```

---

## Acceptance Criteria

- [x] Admin Merchant can add, edit, and delete expenses for their own merchant
- [x] Supervisor can add, edit, and delete expenses for their own merchant
- [x] Superadmin can view and manage expenses across all merchants
- [x] Expenses are filterable by month and category
- [x] Total expenses for the selected period are displayed
- [x] Amount is stored and displayed as an integer in rupiah (no decimals)
- [x] Real-time updates via `onSnapshot`
- [x] Form validates all required fields before submitting
- [x] Delete requires confirmation via dialog

---

*Phase 7 — Expenses Feature*
