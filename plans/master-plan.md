# Master Plan — Product Management & Sales Data Web Application

> **Stack:** React · ShadCN UI · Tailwind CSS · Firebase  
> **Date:** April 19, 2026

---

## Project Overview

A centralized web application for managing merchants, products, users, and sales data. The system supports 4 roles with different access levels, built on Firebase as the backend and React as the frontend.

### Role Hierarchy

```
Superadmin
  └── Admin Merchant
        └── Supervisor
              └── Cashier (mobile only, PIN-based)
```

> **Important:** Cashiers are **not stored** in the `users` collection. They are stored as documents in the `cashiers` subcollection inside each merchant document (`merchants/{merchantId}/cashiers/{pinCode}`). Cashier authentication is done via a 4-digit PIN in the mobile POS app — not Firebase Auth.

---

## Phases

| Phase | Description | Plan |
|---|---|---|
| 1 | Setup & Infrastructure | [phase-1-setup-infrastructure.md](./phase-1-setup-infrastructure.md) |
| 2 | Architecture & Folder Structure | [phase-2-architecture-folder-structure.md](./phase-2-architecture-folder-structure.md) |
| 3 | Authentication & Role Management | [phase-3-authentication-role-management.md](./phase-3-authentication-role-management.md) |
| 4 | Data Model (Firestore) | [phase-4-data-model.md](./phase-4-data-model.md) |
| 5 | Feature & Page Development | [phase-5-feature-page-development.md](./phase-5-feature-page-development.md) |
| 6 | Firebase Security Rules | [phase-6-firebase-security-rules.md](./phase-6-firebase-security-rules.md) |
| 7 | Expenses (Pengeluaran) Feature | [phase-7-expenses.md](./phase-7-expenses.md) |
| 8 | Profit & Loss Report | [phase-8-profit-loss-report.md](./phase-8-profit-loss-report.md) |

> **Note:** Conventions (naming, TypeScript, component, hook, and Firestore best practices) are embedded directly within each phase rather than in a separate document.

---

## Role Access Summary

| Feature | Superadmin | Admin Merchant | Supervisor | Cashier |
|---|:---:|:---:|:---:|:---:|
| Web Login | ✅ | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | ✅ | — |
| Manage Merchants | ✅ | ❌ | ❌ | — |
| Manage Users (Admin/Supervisor) | ✅ | ❌ | ❌ | — |
| Manage Supervisor Users | ✅ | ✅ (own, max 1) | ❌ | — |
| Manage Cashiers (PIN-based) | ✅ | ✅ (own) | ❌ | — |
| Manage Products | ✅ (all) | ✅ (own) | ❌ | — |
| View Sales Data | ✅ (all) | ✅ (own) | ✅ (own, read-only) | — |
| Manage Expenses | ✅ (all) | ✅ (own) | ✅ (own) | — |
| View Profit & Loss Report | ✅ (all) | ✅ (own) | ✅ (own) | — |

> **Admin Merchant constraint:** Admin Merchant can only add **1 supervisor** per merchant and any number of cashiers. Admin Merchant cannot create other admin accounts — only Superadmin can create admin users.

### Role Details

| Role | Storage | Authentication | Notes |
|---|---|---|---|
| **Superadmin** | `users/{uid}` | Firebase Auth (email/password) | No `merchant` field |
| **Admin Merchant** | `users/{uid}` | Firebase Auth (email/password) | Has `merchant` field |
| **Supervisor** | `users/{uid}` | Firebase Auth (email/password) | Has `merchant` field |
| **Cashier** | `merchants/{merchantId}/cashiers/{pinCode}` | 4-digit PIN (mobile only) | **Does not use Firebase Auth** |

---

## Best Practices Checklist

- [ ] Validate input on the client side **and** in Firestore Security Rules
- [ ] Use `onSnapshot` for real-time updates — disconnect listeners when components unmount
- [ ] Implement Firestore pagination with `startAfter()` + `limit()` for large datasets
- [ ] Store currency values as integers (rupiah, not decimals) to avoid floating-point errors
- [ ] Create Firestore indexes for compound queries (e.g., filter by category + order by date)
- [ ] Ensure `.env` is never committed to the repository (check `.gitignore`)
- [ ] Create `.env.example` (without values) as a reference for the team

---

*Master Plan — Product Management & Sales Data Web Application*  
*Stack: React · ShadCN UI · Tailwind CSS · Firebase*
