# Phase 5 — Feature & Page Development

> Part of the [Master Plan](./master-plan.md)

---

## 5.1 Layout Components

### Checklist

- [ ] Create `src/components/layout/AppLayout.tsx` — main layout wrapper with sidebar + header
- [ ] Create `src/components/layout/Sidebar.tsx` — navigation sidebar (role-aware menu items)
- [ ] Create `src/components/layout/Header.tsx` — top header bar with user info and logout
- [ ] Sidebar hides "Merchants" link for Admin Merchant role
- [ ] Layout is responsive (collapsible sidebar on mobile)

---

## 5.2 Login Page (`/login`)

### Checklist

- [ ] Email + password form using ShadCN Input, Label, Button
- [ ] Client-side input validation (required, email format)
- [ ] Handle Firebase Auth errors with user-friendly messages
- [ ] Block cashier users with a clear error message
- [ ] Redirect authenticated users away from login page
- [ ] Loading state on submit button

---

## 5.3 Dashboard Page (`/`)

### Checklist

- [ ] Summary cards: Total Revenue, Total Orders, Avg Order Value
- [ ] Revenue trend chart (Recharts LineChart)
- [ ] Data scoped based on role:
  - Superadmin: aggregated across all merchants
  - Admin Merchant: own merchant only
- [ ] Loading skeletons while data is fetching
- [ ] Handle empty state gracefully

---

## 5.4 Merchants Page (`/merchants`) — Superadmin Only

### Checklist

- [ ] Create `src/components/merchants/MerchantTable.tsx` — table listing all merchants
- [ ] Create `src/components/merchants/MerchantForm.tsx` — add/edit merchant form (dialog)
- [ ] Create `src/components/merchants/MerchantDeleteDialog.tsx` — delete confirmation
- [ ] Add new merchant functionality
- [ ] Edit merchant details (inline or dialog)
- [ ] Delete merchant with confirmation dialog
- [ ] Loading skeletons for table
- [ ] Empty state when no merchants exist

---

## 5.5 Users Page (`/users`)

### Checklist

- [ ] Create `src/components/users/UserTable.tsx` — user list table
- [ ] Create `src/components/users/UserForm.tsx` — add/edit user form (dialog)
- [ ] Create `src/components/users/UserDeleteDialog.tsx` — delete confirmation
- [ ] **Superadmin**: view & manage all users across all merchants
- [ ] **Admin Merchant**: view & manage cashier users within own merchant only
- [ ] Add user with role assignment
- [ ] Edit user details
- [ ] Delete user with confirmation
- [ ] Role-based filtering of visible users
- [ ] Loading skeletons and empty state

---

## 5.6 Products Page (`/products`)

### Checklist

- [ ] Create `src/components/products/ProductTable.tsx` — product list table
- [ ] Create `src/components/products/ProductForm.tsx` — add/edit product form (dialog)
- [ ] Create `src/components/products/ProductDeleteDialog.tsx` — delete confirmation
- [ ] **Superadmin**: all products with merchant filter/selector
- [ ] **Admin Merchant**: own merchant's products only
- [ ] Add product via modal dialog form
- [ ] Edit existing product
- [ ] Delete product with confirmation dialog
- [ ] Support for multiple prices (`prices` array field)
- [ ] Loading skeletons and empty state

---

## 5.7 Sales Page (`/sales`)

### Checklist

- [ ] Create `src/components/sales/SalesSummaryCards.tsx` — KPI cards
- [ ] Create `src/components/sales/SalesChart.tsx` — revenue trend line chart
- [ ] Create `src/components/sales/SalesTable.tsx` — detailed transaction table
- [ ] Summary cards: Total Revenue, Total Orders, Avg Order Value
- [ ] Line chart: Revenue trend by month (Recharts)
- [ ] Detailed sales transaction table
- [ ] **Superadmin**: all merchants with merchant filter
- [ ] **Admin Merchant**: own merchant's data only
- [ ] Date range filtering
- [ ] Loading skeletons and empty state

---

## Conventions for This Phase

### Component Conventions

- One component per file
- Keep components small and single-purpose; extract sub-components when a file exceeds ~150 lines
- Use ShadCN UI as the base; do not build custom UI primitives from scratch
- Apply Tailwind utility classes directly; avoid inline `style` attributes
- Avoid prop drilling more than 2 levels — use context instead

### Hook Conventions

- Each custom hook wraps a single concern (e.g., one Firestore collection)
- Always clean up `onSnapshot` listeners in the `useEffect` return function
- Return `{ data, loading, error }` from every hook

### Firestore Conventions

- Always scope queries to the user's merchant when the role is `admin`
- Use `where()` before `orderBy()` to satisfy Firestore index requirements
- Use `onSnapshot` for lists; use `getDoc` for single document lookups that don't need real-time updates
- Store currency values as integers (rupiah, not decimals) to avoid floating-point errors
- Implement Firestore pagination with `startAfter()` + `limit()` for large datasets

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| React component | PascalCase | `ProductTable` |
| Function / variable | camelCase | `handleDelete`, `merchantId` |
| Module-level constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Firestore collection | kebab-case | `merchants`, `products` |
| Firestore document field | camelCase | `merchantId`, `createdAt` |

### State Management

- Use React Context only for truly global state (auth, current user role)
- Use local `useState` / `useReducer` for component-level state
- Do not put server data in context — fetch it in hooks close to where it is used

---

## Overall Phase 5 Checklist

- [ ] All pages render without errors
- [ ] Navigation between pages works correctly
- [ ] Role-based content scoping verified for both Superadmin and Admin
- [ ] CRUD operations work for Merchants, Users, and Products
- [ ] Sales data displays correctly with charts and tables
- [ ] Responsive layout works on mobile and desktop
- [ ] All component files follow PascalCase naming
- [ ] All hook files follow camelCase with `use` prefix
- [ ] No usage of `any` type in codebase
- [ ] No inline `style` attributes — only Tailwind classes
- [ ] All `onSnapshot` listeners have cleanup functions
- [ ] No prop drilling beyond 2 levels
