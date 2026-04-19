# Phase 1 — Setup & Infrastructure

> Part of the [Master Plan](./master-plan.md)

---

## 1.1 Project Initialization

- [ ] Create Vite + React project: `npm create vite@latest product-management-app -- --template react-ts`
- [ ] Install Tailwind CSS v3 + PostCSS + Autoprefixer
- [ ] Configure `tailwind.config.ts` with `darkMode: ["class"]`
- [ ] Initialize ShadCN UI (`npx shadcn@latest init`) → style: Default, color: Slate, CSS variables: Yes

## 1.2 Dependency Installation

| Package | Purpose |
|---|---|
| `firebase` | Auth + Firestore |
| `react-router-dom` | Client-side routing |
| `recharts` | Sales data visualization |
| `date-fns` | Date formatting |

### Checklist

- [ ] Run `npm install firebase react-router-dom recharts date-fns`
- [ ] Verify all packages in `package.json`

## 1.3 ShadCN Components Installation

```
button · card · table · dialog · input · select · badge · label
sheet · dropdown-menu · avatar · separator · skeleton
```

### Checklist

- [ ] Run `npx shadcn@latest add button card table dialog input select badge label sheet dropdown-menu avatar separator skeleton`
- [ ] Verify components exist in `src/components/ui/`

## 1.4 Firebase Configuration

- [ ] Create project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Firebase Authentication** → Email/Password
- [ ] Enable **Firestore Database** → Test mode (update rules before production)
- [ ] Create `.env` file with 6 Firebase environment variables
- [ ] Add `.env` to `.gitignore`
- [ ] Create `.env.example` (without values) as a team reference
- [ ] Create `src/lib/firebase.ts` → export `auth` and `db`

---

## Overall Phase 1 Checklist

- [ ] Project runs with `npm run dev` without errors
- [ ] Tailwind CSS classes render correctly
- [ ] ShadCN components import and render correctly
- [ ] Firebase initializes without errors (check browser console)
- [ ] `.env` is listed in `.gitignore`
