# Phase 3 — Authentication & Role Management

> Part of the [Master Plan](./master-plan.md)

---

## 3.1 Role Definitions

| Role | Web Access | Data Scoping |
|---|---|---|
| **Superadmin** | All pages | All merchants |
| **Admin Merchant** | Dashboard, Users, Products, Sales | Own merchant only |
| **Cashier** | ❌ (mobile only) | — |

## 3.2 Login Flow

1. User logs in via email + password (Firebase Auth)
2. App fetches the user document from the `users` collection by `auth.uid`
3. Retrieve `role` and `merchant` fields
4. If `role === "cashier"` → sign out + display error message
5. Store role + merchant in `AuthContext`

## 3.3 Route Guard

- Create a `RoleGuard` component that wraps each protected route
- Redirect to Dashboard if the role does not have permission to access the page

---

## Checklist

### AuthContext

- [ ] Create `src/context/AuthContext.tsx`
- [ ] Implement `AuthProvider` with Firebase `onAuthStateChanged` listener
- [ ] Fetch user document from `users` collection after auth state change
- [ ] Store `user`, `role`, and `merchant` in context state
- [ ] Expose `login()`, `logout()`, `loading`, and `error` from context
- [ ] Block cashier role: sign out immediately with error message

### Login Page

- [ ] Create `src/pages/LoginPage.tsx`
- [ ] Build email + password form using ShadCN Input and Button
- [ ] Add client-side validation (required fields, email format)
- [ ] Call `signInWithEmailAndPassword` from Firebase Auth
- [ ] Handle and display Firebase Auth error messages
- [ ] Redirect to Dashboard on successful login

### Route Guard

- [ ] Create `RoleGuard` component
- [ ] Accept `allowedRoles` prop to define which roles can access a route
- [ ] Redirect unauthorized roles to Dashboard (`/`)
- [ ] Redirect unauthenticated users to Login (`/login`)

### Routing Setup

- [ ] Configure `react-router-dom` routes in `App.tsx`
- [ ] Wrap protected routes with `RoleGuard`
- [ ] Define route permissions:
  - `/login` — public (redirect if already logged in)
  - `/` — Superadmin, Admin
  - `/merchants` — Superadmin only
  - `/users` — Superadmin, Admin
  - `/products` — Superadmin, Admin
  - `/sales` — Superadmin, Admin

### Integration Test

- [ ] Superadmin can log in and access all routes
- [ ] Admin Merchant can log in and is blocked from `/merchants`
- [ ] Cashier login attempt is blocked with error message
- [ ] Invalid credentials show proper error message
- [ ] Unauthenticated access redirects to `/login`

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
