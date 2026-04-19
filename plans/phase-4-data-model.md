# Phase 4 — Data Model (Firestore)

> Part of the [Master Plan](./master-plan.md)

---

## Collection: `users`

```json
// Superadmin
{ "name": "...", "email": "...", "role": "superadmin" }

// Admin Merchant
{ "name": "...", "email": "...", "role": "admin", "merchant": "merchant-id" }

// Cashier (mobile only)
{ "name": "...", "email": "...", "role": "cashier", "merchant": "merchant-id" }
```

> The `merchant` field references the document ID in the `merchants` collection. Superadmin does not have a `merchant` field.

## Collection: `merchants/{merchantId}`

```json
{ "name": "Merchant Name" }
```

## Subcollection: `merchants/{merchantId}/products/{productId}`

```json
{
  "name": "Product Name",
  "category": "Category",
  "price": 15000,
  "prices": [10000, 12000, 12500, 15000]
}
```

## Subcollection: `merchants/{merchantId}/sales/{date}`

- Document ID is a date string: `2026-04-19`
- Contains the sales transaction records for that day

---

## Checklist

### TypeScript Interfaces

- [ ] Define `User` interface (`name`, `email`, `role`, `merchant?`)
- [ ] Define `Merchant` interface (`name`)
- [ ] Define `Product` interface (`name`, `category`, `price`, `prices`)
- [ ] Define `Sale` interface (based on sales document structure)
- [ ] Export all interfaces from their respective files

### Firestore Setup

- [ ] Create initial test data in Firestore Console:
  - [ ] At least 1 superadmin user document
  - [ ] At least 1 admin merchant user document
  - [ ] At least 1 cashier user document
  - [ ] At least 1 merchant document
  - [ ] At least 2 product documents under a merchant
  - [ ] At least 1 sales date document under a merchant
- [ ] Verify user documents match `auth.uid` as document ID

### Hooks

- [ ] Create `src/hooks/useMerchants.ts` — fetch merchants list with `onSnapshot`
- [ ] Create `src/hooks/useProducts.ts` — fetch products scoped by merchant with `onSnapshot`
- [ ] Create `src/hooks/useSales.ts` — fetch sales scoped by merchant with `onSnapshot`
- [ ] Create `src/hooks/useUsers.ts` — fetch users (scoped by role/merchant) with `onSnapshot`
- [ ] Each hook returns `{ data, loading, error }`
- [ ] Each hook cleans up `onSnapshot` listener on unmount

---

## Conventions for This Phase

### TypeScript

- Use `interface` for object shapes (props, data models)
- Use `type` for unions, intersections, and aliases
- Avoid `any` — use `unknown` and narrow types explicitly
- Export types/interfaces from the file where they are defined
- Use strict null checks; never assume a value is non-null without verification

### Hook Conventions

- Each custom hook wraps a single concern (e.g., one Firestore collection)
- Always clean up `onSnapshot` listeners in the `useEffect` return function
- Return `{ data, loading, error }` from every hook

### Firestore Conventions

- Always scope queries to the user's merchant when the role is `admin`
- Use `where()` before `orderBy()` to satisfy Firestore index requirements
- Use `onSnapshot` for lists; use `getDoc` for single document lookups that don't need real-time updates
- Store currency values as integers (rupiah, not decimals) to avoid floating-point errors
