# Phase 7 — Conventions

> Part of the [Master Plan](./master-plan.md)

---

## 7.1 File & Folder Naming

| Entity | Convention | Example |
|---|---|---|
| React component | PascalCase | `ProductTable.tsx`, `MerchantForm.tsx` |
| Pages | PascalCase + `Page` suffix | `LoginPage.tsx`, `DashboardPage.tsx` |
| Hooks | camelCase + `use` prefix | `useProducts.ts`, `useSales.ts` |
| Context | PascalCase + `Context` suffix | `AuthContext.tsx` |
| Utility | camelCase | `utils.ts`, `firebase.ts` |
| Folder | camelCase | `components/`, `hooks/`, `pages/`, `lib/` |

## 7.2 TypeScript

- Use `interface` for object shapes (props, data models)
- Use `type` for unions, intersections, and aliases
- Avoid `any` — use `unknown` and narrow types explicitly
- Export types/interfaces from the file where they are defined
- Use strict null checks; never assume a value is non-null without verification

## 7.3 Component Conventions

- One component per file
- Keep components small and single-purpose; extract sub-components when a file exceeds ~150 lines
- Use ShadCN UI as the base; do not build custom UI primitives from scratch
- Apply Tailwind utility classes directly; avoid inline `style` attributes
- Avoid prop drilling more than 2 levels — use context instead

## 7.4 Hook Conventions

- Each custom hook wraps a single concern (e.g., one Firestore collection)
- Always clean up `onSnapshot` listeners in the `useEffect` return function
- Return `{ data, loading, error }` from every hook

## 7.5 Firestore Conventions

- Always scope queries to the user's merchant when the role is `admin`
- Use `where()` before `orderBy()` to satisfy Firestore index requirements
- Use `onSnapshot` for lists; use `getDoc` for single document lookups that don't need real-time updates

## 7.6 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| React component | PascalCase | `ProductTable` |
| Function / variable | camelCase | `handleDelete`, `merchantId` |
| Module-level constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS class (Tailwind) | kebab-case (auto) | `text-sm`, `rounded-lg` |
| Firestore collection | kebab-case | `merchants`, `products` |
| Firestore document field | camelCase | `merchantId`, `createdAt` |

---

## Checklist

- [ ] All component files follow PascalCase naming
- [ ] All hook files follow camelCase with `use` prefix
- [ ] All page files have `Page` suffix
- [ ] No usage of `any` type in codebase
- [ ] All interfaces and types are properly exported
- [ ] No inline `style` attributes — only Tailwind classes
- [ ] All `onSnapshot` listeners have cleanup functions
- [ ] All hooks return `{ data, loading, error }` pattern
- [ ] Firestore queries are properly scoped by role
- [ ] No prop drilling beyond 2 levels
