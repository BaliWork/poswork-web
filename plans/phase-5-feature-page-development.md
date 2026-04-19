# Phase 5 — Feature & Page Development

> Part of the [Master Plan](./master-plan.md)

---

## 5.1 Layout Components

### Checklist

- [x] Create `src/components/layout/AppLayout.tsx` — main layout wrapper with sidebar + header
- [x] Create `src/components/layout/Sidebar.tsx` — navigation sidebar (role-aware menu items)
- [x] Create `src/components/layout/Header.tsx` — top header bar with user info and logout
- [x] Sidebar hides "Merchants" link for Admin Merchant role
- [x] Layout is responsive (collapsible sidebar on mobile)

---

## 5.2 Login Page (`/login`)

### Checklist

- [x] Email + password form using ShadCN Input, Label, Button
- [x] Client-side input validation (required, email format)
- [x] Handle Firebase Auth errors with user-friendly messages
- [x] Block cashier users with a clear error message
- [x] Redirect authenticated users away from login page
- [x] Loading state on submit button

---

## 5.3 Dashboard Page (`/`)

### Checklist

- [x] Summary cards: Total Revenue, Total Orders, Avg Order Value
- [x] Revenue trend chart (Recharts LineChart)
- [x] Data scoped based on role:
  - Superadmin: aggregated across all merchants
  - Admin Merchant: own merchant only
- [x] Loading skeletons while data is fetching
- [x] Handle empty state gracefully

---

## 5.4 Merchants Page (`/merchants`) — Superadmin Only

### Checklist

- [x] Create `src/components/merchants/MerchantTable.tsx` — table listing all merchants
- [x] Create `src/components/merchants/MerchantForm.tsx` — add/edit merchant form (dialog)
- [x] Create `src/components/merchants/MerchantDeleteDialog.tsx` — delete confirmation
- [x] Add new merchant functionality
- [x] Edit merchant details (inline or dialog)
- [x] Delete merchant with confirmation dialog
- [x] Loading skeletons for table
- [x] Empty state when no merchants exist

---

## 5.5 Users Page (`/users`)

### Checklist

- [x] Create `src/components/users/UserTable.tsx` — user list table
- [x] Create `src/components/users/UserForm.tsx` — add/edit user form (dialog)
- [x] Create `src/components/users/UserDeleteDialog.tsx` — delete confirmation
- [x] **Superadmin**: view & manage all users across all merchants
- [x] **Admin Merchant**: view & manage cashier users within own merchant only
- [x] Add user with role assignment
- [x] Edit user details
- [x] Delete user with confirmation
- [x] Role-based filtering of visible users
- [x] Loading skeletons and empty state

---

## 5.6 Products Page (`/products`)

### Checklist

- [x] Create `src/components/products/ProductTable.tsx` — product list table
- [x] Create `src/components/products/ProductForm.tsx` — add/edit product form (dialog)
- [x] Create `src/components/products/ProductDeleteDialog.tsx` — delete confirmation
- [x] **Superadmin**: all products with merchant filter/selector
- [x] **Admin Merchant**: own merchant's products only
- [x] Add product via modal dialog form
- [x] Edit existing product
- [x] Delete product with confirmation dialog
- [x] Support for multiple prices (`prices` array field)
- [x] Loading skeletons and empty state

---

## 5.7 Sales Page (`/sales`)

### Checklist

- [x] Create `src/components/sales/SalesSummaryCards.tsx` — KPI cards
- [x] Create `src/components/sales/SalesChart.tsx` — revenue trend line chart
- [x] Create `src/components/sales/SalesTable.tsx` — detailed transaction table
- [x] Summary cards: Total Revenue, Total Orders, Avg Order Value
- [x] Line chart: Revenue trend by month (Recharts)
- [x] Detailed sales transaction table
- [x] **Superadmin**: all merchants with merchant filter
- [x] **Admin Merchant**: own merchant's data only
- [x] Date range filtering
- [x] Loading skeletons and empty state

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

- [x] All pages render without errors
- [x] Navigation between pages works correctly
- [x] Role-based content scoping verified for both Superadmin and Admin
- [x] CRUD operations work for Merchants, Users, and Products
- [x] Sales data displays correctly with charts and tables
- [x] Responsive layout works on mobile and desktop
- [x] All component files follow PascalCase naming
- [x] All hook files follow camelCase with `use` prefix
- [x] No usage of `any` type in codebase
- [x] No inline `style` attributes — only Tailwind classes
- [x] All `onSnapshot` listeners have cleanup functions
- [x] No prop drilling beyond 2 levels
