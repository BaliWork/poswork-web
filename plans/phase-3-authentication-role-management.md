# Phase 3 — Authentication & Role Management

> Part of the [Master Plan](./master-plan.md)

---

## 3.1 Role Definitions

### Hierarchy

```
Superadmin
  └── Admin Merchant
        └── Supervisor
              └── Cashier (mobile only, PIN 4 digit)
```

| Role | Web Access | Data Scoping | Storage |
|---|---|---|---|
| **Superadmin** | All pages | All merchants | `users/{uid}` — no `merchant` field |
| **Admin Merchant** | Dashboard, Users (supervisor only, max 1), Cashiers, Products, Sales, Expenses, Reports | Own merchant only | `users/{uid}` — with `merchant` field |
| **Supervisor** | Dashboard, Sales (read-only), Expenses, Reports | Own merchant only | `users/{uid}` — with `merchant` field |
| **Cashier** | ❌ (mobile only, PIN) | — | `merchants/{merchantId}/cashiers/{pinCode}` |

> **Important:** Cashiers do **not** use Firebase Auth and are **not** stored in the `users` collection. They are stored in the `cashiers` subcollection inside a merchant document. Authentication is done via a 4-digit PIN in the mobile POS app.

## 3.2 Login Flow

1. User logs in via email + password (Firebase Auth)
2. App fetches the user document from the `users` collection by `auth.uid`
3. Retrieve `role` and `merchant` fields
4. Role validation:
   - If `role === "superadmin"` → full access to all pages
   - If `role === "admin"` → access scoped to own merchant
   - If `role === "supervisor"` → access scoped to own merchant (subset of admin)
   - Any other unrecognized role → sign out + display error message
5. Store role + merchant in `AuthContext`

> **Note:** Cashiers **cannot log in** via the web app. They use a 4-digit PIN in the mobile POS app and do not have a Firebase Auth account.

## 3.3 Route Guard

- Create a `RoleGuard` component that wraps each protected route
- Accept `allowedRoles` prop: `Array<'superadmin' | 'admin' | 'supervisor'>`
- Redirect to Dashboard if the role does not have permission to access the page
- Redirect to `/login` if user is not authenticated

### Route Permissions

| Route | Superadmin | Admin | Supervisor |
|---|:---:|:---:|:---:|
| `/login` | redirect | redirect | redirect |
| `/` (Dashboard) | ✅ | ✅ | ✅ |
| `/merchants` | ✅ | ❌ | ❌ |
| `/users` | ✅ | ✅ | ❌ |
| `/cashiers` | ✅ | ✅ | ❌ |
| `/products` | ✅ | ✅ | ❌ |
| `/sales` | ✅ | ✅ | ✅ (read-only) |
| `/expenses` | ✅ | ✅ | ✅ |
| `/reports` | ✅ | ✅ | ✅ |

---

## Checklist

### AuthContext

- [x] Create `src/context/AuthContext.tsx`
- [x] Implement `AuthProvider` with Firebase `onAuthStateChanged` listener
- [x] Fetch user document from `users` collection after auth state change
- [x] Store `user`, `role`, and `merchant` in context state
- [x] Expose `login()`, `logout()`, `loading`, and `error` from context
- [x] Update `role` type: `'superadmin' | 'admin' | 'supervisor'`
- [x] Remove cashier blocking logic — cashiers have no Firebase Auth account and cannot log in at all
- [x] Add validation: if role is unrecognized (`!['superadmin','admin','supervisor'].includes(role)`) → sign out + error

### Login Page

- [x] Create `src/pages/LoginPage.tsx`
- [x] Build email + password form using ShadCN Input and Button
- [x] Add client-side validation (required fields, email format)
- [x] Call `signInWithEmailAndPassword` from Firebase Auth
- [x] Handle and display Firebase Auth error messages
- [x] Redirect to Dashboard on successful login
- [x] Remove cashier-specific error message — cashiers cannot log in because they have no Firebase Auth account

### Route Guard

- [x] Create `RoleGuard` component
- [x] Accept `allowedRoles` prop to define which roles can access a route
- [x] Redirect unauthorized roles to Dashboard (`/`)
- [x] Redirect unauthenticated users to Login (`/login`)
- [x] Update `allowedRoles` type: `Array<'superadmin' | 'admin' | 'supervisor'>`

### Routing Setup

- [x] Configure `react-router-dom` routes in `App.tsx`
- [x] Wrap protected routes with `RoleGuard`
- [x] Update route permissions as per the table in 3.3:
  - `/login` — public (redirect if already logged in)
  - `/` — superadmin, admin, supervisor
  - `/merchants` — superadmin only
  - `/users` — superadmin, admin
  - `/cashiers` — superadmin, admin *(supervisor cannot manage cashiers)*
  - `/products` — superadmin, admin *(supervisor cannot manage products)*
  - `/sales` — superadmin, admin, supervisor (supervisor: read-only UI)
  - `/expenses` — superadmin, admin, supervisor
  - `/reports` — superadmin, admin, supervisor

### Integration Test

- [x] Superadmin can log in and access all routes
- [x] Admin Merchant can log in and is blocked from `/merchants`
- [x] Supervisor can log in and is blocked from `/merchants`, `/users`, `/cashiers`, and `/products`
- [x] Supervisor can access `/sales` (read-only), `/expenses`, and `/reports`
- [x] Admin Merchant can log in and is blocked from `/merchants`
- [ ] Admin Merchant can access `/users` but can only create/manage 1 supervisor per merchant
- [ ] Admin Merchant can access `/cashiers` and manage cashiers freely
- [x] Invalid credentials show proper error message
- [x] Unauthenticated access redirects to `/login`
- [x] Users with an unrecognized role are signed out automatically

---

## Conventions for This Phase

### TypeScript

- Use `interface` for object shapes (props, data models)
- Use `type` for unions, intersections, and aliases
- Avoid `any` — use `unknown` and narrow types explicitly
- Export types/interfaces from the file where they are defined
- Use strict null checks; never assume a value is non-null without verification

### Component Conventions

- One component per file
- Keep components small and single-purpose; extract sub-components when a file exceeds ~150 lines
- Use ShadCN UI as the base; do not build custom UI primitives from scratch
- Apply Tailwind utility classes directly; avoid inline `style` attributes

### State Management

- Use React Context only for truly global state (auth, current user role)
- Use local `useState` / `useReducer` for component-level state
- Avoid prop drilling more than 2 levels — use context instead
