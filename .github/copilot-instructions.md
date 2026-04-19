# Product Management & Sales Data Web Application

> A full-stack web application for managing products and visualizing sales data, built with **React**, **ShadCN UI**, **Tailwind CSS**, and **Firebase**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Firebase Configuration](#6-firebase-configuration)
7. [Authentication & Roles](#7-authentication--roles)
8. [Features & Pages](#8-features--pages)
9. [Data Models (Firestore)](#9-data-models-firestore)
10. [Firebase Security Rules](#10-firebase-security-rules)
11. [Conventions](#11-conventions)

---

## 1. Project Overview

This application provides a centralized web platform for managing multiple merchants, their products, users, and sales data. The system supports 3 roles with different levels of access:

- **Superadmin** — Full access across all merchants: manage merchants, all users, and all product data.
- **Admin Merchant** — Manage cashier users and product data scoped to their own merchant only.
- **Cashier Merchant** — Mobile app only. Cannot log in to this web application.

The app is designed with a clean, responsive UI using ShadCN components and Tailwind CSS, with Firebase Auth and Firestore serving as the backend for authentication, role-based access control, and real-time data.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18+ (Vite + TypeScript) | UI rendering and component logic |
| Language | TypeScript | Type-safe development |
| UI Components | ShadCN UI | Pre-built accessible components |
| Styling | Tailwind CSS v3 | Utility-first styling |
| Backend / Database | Firebase Firestore | NoSQL real-time database |
| Authentication | Firebase Auth | User login and access control |
| Charts | Recharts | Sales data visualization |
| Routing | React Router v6 | Client-side navigation |
| State Management | React Context API | Global app state |

---

## 3. Project Structure

```
product-management-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                        # ShadCN auto-generated components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Navigation sidebar (role-aware)
│   │   │   ├── Header.tsx             # Top header bar
│   │   │   └── AppLayout.tsx          # Main layout wrapper
│   │   ├── merchants/
│   │   │   ├── MerchantTable.tsx      # Merchant list table (superadmin only)
│   │   │   ├── MerchantForm.tsx       # Add/edit merchant form
│   │   │   └── MerchantDeleteDialog.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx          # User list table
│   │   │   ├── UserForm.tsx           # Add/edit user form
│   │   │   └── UserDeleteDialog.tsx
│   │   ├── products/
│   │   │   ├── ProductTable.tsx       # Product list table
│   │   │   ├── ProductForm.tsx        # Add/edit product form
│   │   │   └── ProductDeleteDialog.tsx
│   │   └── sales/
│   │       ├── SalesSummaryCards.tsx  # KPI cards (revenue, orders, avg)
│   │       ├── SalesTable.tsx         # Sales records table
│   │       └── SalesChart.tsx         # Revenue trend line chart
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MerchantsPage.tsx          # Superadmin only
│   │   ├── UsersPage.tsx              # Superadmin: all users | Admin: cashiers only
│   │   ├── ProductsPage.tsx           # Superadmin: all merchants | Admin: own merchant
│   │   └── SalesPage.tsx
│   ├── context/
│   │   └── AuthContext.tsx            # Firebase Auth + role context
│   ├── hooks/
│   │   ├── useProducts.ts             # Firestore products hook (merchant-scoped)
│   │   ├── useSales.ts                # Firestore sales hook (merchant-scoped)
│   │   ├── useUsers.ts                # Firestore users hook
│   │   └── useMerchants.ts            # Firestore merchants hook
│   ├── lib/
│   │   ├── firebase.ts                # Firebase initialization
│   │   └── utils.ts                   # ShadCN utility (cn helper)
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── components.json                    # ShadCN config
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Prerequisites

Make sure the following are installed before starting:

- **Node.js** v18 or higher
- **npm** v9 or higher (or **yarn** / **pnpm**)
- A **Firebase** project (free Spark plan is sufficient)
- **Git**

---

## 5. Installation & Setup

### Step 1 — Create Vite + React Project

```bash
npm create vite@latest product-management-app -- --template react-ts
cd product-management-app
npm install
```

### Step 2 — Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```js
import type { Config } from 'tailwindcss'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
    },
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3 — Initialize ShadCN UI

```bash
npx shadcn@latest init
```

Answer the prompts as follows:

```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › yes
✔ Are you using React Server Components? › no
```

### Step 4 — Install ShadCN Components

```bash
npx shadcn@latest add button card table dialog input select badge label sheet dropdown-menu avatar separator skeleton
```

### Step 5 — Install Additional Dependencies

```bash
# Firebase
npm install firebase

# Routing
npm install react-router-dom

# Charts
npm install recharts

# Date formatting
npm install date-fns
```

---

## 6. Firebase Configuration

### Step 1 — Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** and follow the setup steps
3. In your project dashboard, click **"Web"** (`</>`) to register a web app
4. Copy the Firebase config object

### Step 2 — Enable Services

In the Firebase console, enable:

- **Authentication** → Sign-in method → **Email/Password**
- **Firestore Database** → Create database → Start in **test mode** (update rules before production)

### Step 3 — Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Important:** Add `.env` to your `.gitignore` file. Never commit API keys to version control.

Create `.env.example` (safe to commit):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Step 4 — Firebase Initialization

Create `src/lib/firebase.ts`:

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

---

## 7. Authentication & Roles

### Login Flow (Web Application)

Only **Superadmin** and **Admin Merchant** can log in to this web application using email and password via Firebase Authentication. After login, the app fetches the user's document from the `users` collection to retrieve their `role` and `merchant` fields, which are then used to control navigation and data access throughout the app.

**Cashier users are restricted to the mobile application only.** If a user with `role: "cashier"` attempts to log in on the web, they must be blocked at the application level by checking their role immediately after authentication and signing them out with an appropriate error message.

### Role Definitions

**Superadmin**
- Has no `merchant` field in their user document
- Can access all pages: Dashboard, Merchants, Users, Products, Sales
- Data is not scoped — they can see and manage everything across all merchants

**Admin Merchant**
- Has a `merchant` field referencing their merchant ID (e.g., `blayag-dek-ani`)
- Can access: Dashboard, Users (cashiers only), Products (own merchant), Sales (own merchant)
- Cannot access the Merchants page
- All Firestore queries are automatically scoped to their `merchant` value

**Cashier Merchant**
- Stored in the `users` collection with `role: "cashier"`
- Authenticates via PIN on the mobile app — not via Firebase Auth email/password
- Has no access to this web application

### Role-Based Route Guard

Routes are protected using a `RoleGuard` component that checks the current user's role before rendering a page. If the role does not have permission, the user is redirected to the Dashboard.

---

## 8. Features & Pages

### Role-Based Access Summary

| Feature | Superadmin | Admin Merchant | Cashier |
|---|---|---|---|
| Login (Web) | Yes | Yes | **No** (mobile only) |
| Dashboard | Yes | Yes | — |
| Manage Merchants | Yes | No | — |
| Manage All Users | Yes | No | — |
| Manage Cashier Users | Yes | Yes (own merchant) | — |
| Manage Products | Yes (all merchants) | Yes (own merchant) | — |
| View Sales Data | Yes (all merchants) | Yes (own merchant) | — |

### Pages Overview

| Page | Path | Accessible By |
|---|---|---|
| Login | `/login` | Superadmin, Admin Merchant |
| Dashboard | `/` | Superadmin, Admin Merchant |
| Merchants | `/merchants` | Superadmin only |
| Users | `/users` | Superadmin (all), Admin Merchant (cashiers only) |
| Products | `/products` | Superadmin (all), Admin Merchant (own merchant) |
| Sales | `/sales` | Superadmin (all), Admin Merchant (own merchant) |

### Feature Details

#### Merchants Page *(Superadmin only)*

- View all registered merchants in a table
- Add new merchant
- Edit merchant details
- Delete merchant

#### Users Page

- **Superadmin**: View and manage all users across all merchants (superadmin, admin, cashier)
- **Admin Merchant**: View and manage cashier users within their own merchant only
- Add new user with role assignment
- Edit user details
- Delete user

#### Products Page

- **Superadmin**: View and manage products across all merchants, with merchant filter
- **Admin Merchant**: View and manage products scoped to their own merchant only
- Add new product via a modal dialog form
- Edit existing product
- Delete product with confirmation dialog

#### Sales Page

- Summary cards: Total Revenue, Total Orders, Average Order Value
- Line chart: Revenue trend by month
- Table: Detailed sales transaction records
- **Superadmin**: Can view sales across all merchants with merchant filter
- **Admin Merchant**: Sales data scoped to their own merchant only

---

## 9. Data Models (Firestore)

### Collection: `users`

```
users/{userId}
```

All authenticated web users (superadmin and admin merchant) are stored here. Cashier users are also stored here but are only accessible via the mobile app using a PIN-based login.

```json
{
  "name": "Superadmin",
  "email": "superadmin@gmail.com",
  "role": "superadmin"
}
```

```json
{
  "name": "Admin",
  "email": "admin.merchant@gmail.com",
  "role": "admin",
  "merchant": "blayag-dek-ani"
}
```

```json
{
  "name": "Kasir 1",
  "email": "cashier@gmail.com",
  "role": "cashier",
  "merchant": "blayag-dek-ani"
}
```

> **Note:** The `merchant` field references the document ID in the `merchants` collection. Superadmin does not have a `merchant` field. Cashier users authenticate via PIN on the mobile app — they cannot log in to this web application.

---

### Collection: `merchants`

```
merchants/{merchantId}
```

Each merchant document contains its own `products` and `sales` as subcollections.

```json
{
  "name": "Blayag Dek Ani",
  "products": {
    "product_id": {
      "name": "Blayag Bungkus",
      "category": "Makanan",
      "price": 15000,
      "prices": [
        10000,
        12000,
        12500,
        15000
      ]
    }
  },
  "sales": {
    "2026-04-19": {},
    "2026-04-18": {}
  }
}
```

#### Subcollection: `merchants/{merchantId}/products/{productId}`

```json
{
  "name": "Blayag Bungkus",
  "category": "Makanan",
  "price": 15000,
  "prices": [
    10000,
    12000,
    12500,
    15000
  ]
}
```

#### Subcollection: `merchants/{merchantId}/sales/{date}`

Sales are grouped by date as the document ID (e.g., `2026-04-19`). Each date document contains the transaction records for that day.

---

## 10. Firebase Security Rules

After development, update Firestore rules in the Firebase console. Rules enforce role-based access so that admin merchant users can only read and write data within their own merchant.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function getUser() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isSuperadmin() {
      return isSignedIn() && getUser().role == 'superadmin';
    }

    function isAdmin() {
      return isSignedIn() && getUser().role == 'admin';
    }

    function isAdminOfMerchant(merchantId) {
      return isAdmin() && getUser().merchant == merchantId;
    }

    // users collection
    // Superadmin: full access
    // Admin: can read/write cashier users within their own merchant
    match /users/{userId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdmin() && (
        resource.data.merchant == getUser().merchant &&
        resource.data.role == 'cashier'
      );
      allow write: if isAdmin() && (
        request.resource.data.merchant == getUser().merchant &&
        request.resource.data.role == 'cashier'
      );
    }

    // merchants collection
    // Superadmin: full access to merchant documents
    // Admin: read-only on their own merchant document
    match /merchants/{merchantId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdminOfMerchant(merchantId);

      // products subcollection
      match /products/{productId} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
      }

      // sales subcollection
      match /sales/{saleDate} {
        allow read, write: if isSuperadmin();
        allow read: if isAdminOfMerchant(merchantId);
      }
    }
  }
}
```

---

## 11. Conventions

### File & Folder Naming

- **Components**: PascalCase — `ProductTable.tsx`, `MerchantForm.tsx`
- **Pages**: PascalCase with `Page` suffix — `LoginPage.tsx`, `DashboardPage.tsx`
- **Hooks**: camelCase with `use` prefix — `useProducts.ts`, `useSales.ts`
- **Context files**: PascalCase with `Context` suffix — `AuthContext.tsx`
- **Utility files**: camelCase — `utils.ts`, `firebase.ts`
- **Folders**: camelCase — `components/`, `hooks/`, `pages/`, `lib/`

### TypeScript

- Use `interface` for object shapes (props, data models)
- Use `type` for unions, intersections, and aliases
- Avoid `any` — use `unknown` and narrow types explicitly
- Export types/interfaces from the file where they are defined
- Use strict null checks; never assume a value is non-null without verification

### Components

- One component per file
- Keep components small and single-purpose; extract sub-components when a file exceeds ~150 lines
- Pass only the props a component needs — avoid prop drilling more than 2 levels; use context instead
- Use ShadCN UI components as the base; do not build custom UI primitives from scratch
- Apply Tailwind utility classes directly; avoid inline `style` attributes

### Hooks

- Each custom hook wraps a single concern (e.g., one Firestore collection)
- Always clean up `onSnapshot` listeners in the `useEffect` return function
- Return loading and error states alongside data: `{ data, loading, error }`

### Firestore Queries

- Always scope queries to the current user's merchant when the role is `admin`
- Use `where()` clauses before `orderBy()` to satisfy Firestore index requirements
- Prefer `onSnapshot` for lists; use `getDoc` for single document lookups that don't need real-time updates

### State Management

- Use React Context only for truly global state (auth, current user role)
- Use local `useState` / `useReducer` for component-level state
- Do not put server data in context — fetch it in hooks close to where it is used

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| React component | PascalCase | `ProductTable` |
| Function / variable | camelCase | `handleDelete`, `merchantId` |
| Constant (module-level) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS class (Tailwind) | kebab-case (auto) | `text-sm`, `rounded-lg` |
| Firestore collection | kebab-case | `merchants`, `products` |
| Firestore document field | camelCase | `merchantId`, `createdAt` |

### Git

- Branch naming: `feat/`, `fix/`, `chore/` prefixes — e.g., `feat/products-page`
- Commit messages: imperative mood — `Add product form validation`, `Fix merchant filter query`
- Never commit `.env` or any file containing secrets

---

## Notes & Best Practices

- Always validate user input on both client and Firestore Security Rules level.
- Use `onSnapshot` for real-time updates — disconnect listeners when components unmount.
- For large datasets, implement Firestore pagination using `startAfter()` and `limit()`.
- Store currency values as integers (in smallest unit, e.g., cents or rupiah) to avoid floating-point issues.
- Use Firestore indexes for compound queries (e.g., filtering by category AND ordering by date).
- Keep Firebase API keys in `.env` and never expose them in public repositories.

---

*Generated for: Product Management & Sales Data Web Application*
*Stack: React · ShadCN UI · Tailwind CSS · Firebase*
