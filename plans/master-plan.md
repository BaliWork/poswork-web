# Master Plan — Product Management & Sales Data Web Application

> **Stack:** React · ShadCN UI · Tailwind CSS · Firebase  
> **Date:** April 19, 2026

---

## Project Overview

A centralized web application for managing merchants, products, users, and sales data. The system supports 3 roles with different access levels, built on Firebase as the backend and React as the frontend.

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

> **Note:** Conventions (naming, TypeScript, component, hook, and Firestore best practices) are embedded directly within each phase rather than in a separate document.

---

## Role Access Summary

| Feature | Superadmin | Admin Merchant | Cashier |
|---|:---:|:---:|:---:|
| Web Login | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | — |
| Manage Merchants | ✅ | ❌ | — |
| Manage All Users | ✅ | ❌ | — |
| Manage Cashier Users | ✅ | ✅ (own) | — |
| Manage Products | ✅ (all) | ✅ (own) | — |
| View Sales Data | ✅ (all) | ✅ (own) | — |

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
