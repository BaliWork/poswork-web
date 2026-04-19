# Phase 1 — Setup & Infrastructure

> Part of the [Master Plan](./master-plan.md)

---

## 1.1 Project Initialization

- [x] Create Vite + React project: `npm create vite@latest product-management-app -- --template react-ts`
- [x] Install Tailwind CSS v3 + PostCSS + Autoprefixer
- [x] Configure `tailwind.config.ts` with `darkMode: ["class"]`
- [x] Initialize ShadCN UI (`npx shadcn@latest init`) → style: Default, color: Slate, CSS variables: Yes

## 1.2 Dependency Installation

| Package | Purpose |
|---|---|
| `firebase` | Auth + Firestore |
| `react-router-dom` | Client-side routing |
| `recharts` | Sales data visualization |
| `date-fns` | Date formatting |

### Checklist

- [x] Run `npm install firebase react-router-dom recharts date-fns`
- [x] Verify all packages in `package.json`

## 1.3 ShadCN Components Installation

```
button · card · table · dialog · input · select · badge · label
sheet · dropdown-menu · avatar · separator · skeleton
```

### Checklist

- [x] Run `npx shadcn@latest add button card table dialog input select badge label sheet dropdown-menu avatar separator skeleton`
- [x] Verify components exist in `src/components/ui/`

## 1.4 Firebase Configuration

- [x] Create project at [console.firebase.google.com](https://console.firebase.google.com)
- [x] Enable **Firebase Authentication** → Email/Password
- [x] Enable **Firestore Database** → Test mode (update rules before production)
- [x] Create `.env` file with 6 Firebase environment variables
- [x] Add `.env` to `.gitignore`
- [x] Create `.env.example` (without values) as a team reference
- [x] Create `src/lib/firebase.ts` → export `auth` and `db`

---

## Overall Phase 1 Checklist

- [x] Project runs with `npm run dev` without errors
- [x] Tailwind CSS classes render correctly
- [x] ShadCN components import and render correctly
- [x] Firebase initializes without errors (check browser console)
- [x] `.env` is listed in `.gitignore`
