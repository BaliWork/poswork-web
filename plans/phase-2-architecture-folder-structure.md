# Phase 2 — Architecture & Folder Structure

> Part of the [Master Plan](./master-plan.md)

---

## Target Structure

```
src/
├── assets/
├── components/
│   ├── ui/                        # ShadCN auto-generated components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx            # Navigation sidebar (role-aware)
│   │   ├── Header.tsx             # Top header bar
│   │   └── AppLayout.tsx          # Main layout wrapper
│   ├── merchants/
│   │   ├── MerchantTable.tsx      # Merchant list table (superadmin only)
│   │   ├── MerchantForm.tsx       # Add/edit merchant form
│   │   └── MerchantDeleteDialog.tsx
│   ├── users/
│   │   ├── UserTable.tsx          # User list table
│   │   ├── UserForm.tsx           # Add/edit user form
│   │   └── UserDeleteDialog.tsx
│   ├── products/
│   │   ├── ProductTable.tsx       # Product list table
│   │   ├── ProductForm.tsx        # Add/edit product form
│   │   └── ProductDeleteDialog.tsx
│   └── sales/
│       ├── SalesSummaryCards.tsx   # KPI cards (revenue, orders, avg)
│       ├── SalesTable.tsx         # Sales records table
│       └── SalesChart.tsx         # Revenue trend line chart
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MerchantsPage.tsx          # Superadmin only
│   ├── UsersPage.tsx              # Superadmin: all users | Admin: cashiers only
│   ├── ProductsPage.tsx           # Superadmin: all merchants | Admin: own merchant
│   └── SalesPage.tsx
├── context/
│   └── AuthContext.tsx            # Firebase Auth + role context
├── hooks/
│   ├── useProducts.ts             # Firestore products hook (merchant-scoped)
│   ├── useSales.ts                # Firestore sales hook (merchant-scoped)
│   ├── useUsers.ts                # Firestore users hook
│   └── useMerchants.ts            # Firestore merchants hook
├── lib/
│   ├── firebase.ts                # Firebase initialization
│   └── utils.ts                   # ShadCN utility (cn helper)
├── App.tsx
└── main.tsx
```

---

## Checklist

- [ ] Create `src/components/layout/` folder
- [ ] Create `src/components/merchants/` folder
- [ ] Create `src/components/users/` folder
- [ ] Create `src/components/products/` folder
- [ ] Create `src/components/sales/` folder
- [ ] Create `src/pages/` folder
- [ ] Create `src/context/` folder
- [ ] Create `src/hooks/` folder
- [ ] Create `src/lib/` folder with `firebase.ts` and `utils.ts`
- [ ] Verify all folders are in place and the project compiles
