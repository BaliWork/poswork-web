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

- Document ID adalah string tanggal: `2026-04-18`
- Setiap dokumen berisi `opening_balance`, `closing_balance` (opsional), dan `orders`

```json
{
  "opening_balance": {
    "id": "c1d8ed14-cc0c-4cf8-8303-53a6d7aac396",
    "balance": 500000,
    "created_by": "Kasir Utama",
    "date": "2026-04-18T07:58:09.052901"
  },
  "closing_balance": {
    "cahsier_name": "Kasir Utama 1",
    "cashier_balance": 1000000,
    "closing_date": "2026-04-18T16:48:14.423981",
    "duration": "8 jam 50 menit",
    "net_amount": 5797000,
    "opening_balance": 500000,
    "total_cash": 5015000,
    "total_non_cash": 782000
  },
  "orders": [
    {
      "counter": 88,
      "created_by": "Kasir Utama",
      "customer_name": "cs",
      "id": "019d9fa8-4904-7c32-98ce-7d6bdfe4e400",
      "money_received": 50000,
      "order_date": "2026-04-18T08:20:23.735330Z",
      "order_number": "BDA-20260418-0088",
      "payment_type": "CASH",
      "status": "PAID",
      "sub_total": 30000,
      "total_payment": 30000,
      "order_details": [
        {
          "description": null,
          "grand_total": 20000,
          "id": "019d9fad-107c-7405-bf61-ded316395cfb",
          "order_id": "019d9fa8-4904-7c32-98ce-7d6bdfe4e400",
          "product_id": "019d0459-a3ac-7dae-b564-912ef50aa5f7",
          "product_name": "Nasi Campur Bungkus",
          "quantity": 1,
          "sub_total": 20000
        }
      ]
    }
  ]
}
```

---

## Checklist

### TypeScript Interfaces

- [x] Define `User` interface (`name`, `email`, `role`, `merchant?`)
- [x] Define `Merchant` interface (`name`)
- [x] Define `Product` interface (`name`, `category`, `price`, `prices`)
- [x] Define `Sale` interface (based on sales document structure)
- [x] Export all interfaces from their respective files

### Firestore Setup

- [x] Create initial test data in Firestore Console:
  - [x] At least 1 superadmin user document
  - [x] At least 1 admin merchant user document
  - [x] At least 1 cashier user document
  - [x] At least 1 merchant document
  - [x] At least 2 product documents under a merchant
  - [x] At least 1 sales date document under a merchant
- [x] Verify user documents match `auth.uid` as document ID

### Hooks

- [x] Create `src/hooks/useMerchants.ts` — fetch merchants list with `onSnapshot`
- [x] Create `src/hooks/useProducts.ts` — fetch products scoped by merchant with `onSnapshot`
- [x] Create `src/hooks/useSales.ts` — fetch sales scoped by merchant with `onSnapshot`
- [x] Create `src/hooks/useUsers.ts` — fetch users (scoped by role/merchant) with `onSnapshot`
- [x] Each hook returns `{ data, loading, error }`
- [x] Each hook cleans up `onSnapshot` listener on unmount

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
