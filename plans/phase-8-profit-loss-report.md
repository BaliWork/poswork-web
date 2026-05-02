# Phase 8 — Profit & Loss Report (Laporan Laba Rugi)

> **Goal:** Implement a Profit & Loss (Laba Rugi) report page that calculates net profit by combining total revenue from sales transactions and total expenses (pengeluaran) for a selected period, per merchant.

---

## Overview

The Profit & Loss report gives merchants a clear view of their financial performance by comparing:

- **Pemasukan (Revenue):** Total sales revenue from the `merchants/{merchantId}/sales` subcollection
- **Pengeluaran (Expenses):** Total expenses from the `merchants/{merchantId}/expenses` subcollection
- **Laba / Rugi (Net Profit / Loss):** Revenue minus Expenses

The report is filterable by month and year, and supports merchant-scoped access control.

---

## Financial Formula

```
Laba Bersih = Total Pemasukan - Total Pengeluaran

Total Pemasukan = Sum of all sales transaction totals in the period
Total Pengeluaran = Sum of all expense amounts in the period
Laba / Rugi = Positive (laba) or Negative (rugi)
```

---

## Data Sources

| Source | Firestore Path | Field Used |
|---|---|---|
| Sales Revenue | `merchants/{merchantId}/sales/{date}` | `total` per transaction record |
| Expenses | `merchants/{merchantId}/expenses/{expenseId}` | `amount` field |

> **Note:** Sales documents are grouped by date. Transactions within each date document must be summed to get daily revenue. Refer to Phase 4 (Data Model) for the sales document structure.

---

## TypeScript Types

Add to `src/types/index.ts`:

```ts
export interface ProfitLossSummary {
  period: string;          // e.g., "April 2026"
  totalRevenue: number;    // Total pemasukan (rupiah)
  totalExpenses: number;   // Total pengeluaran (rupiah)
  netProfit: number;       // totalRevenue - totalExpenses (can be negative)
  isProfit: boolean;       // netProfit >= 0
}

export interface MonthlyBreakdown {
  month: string;           // e.g., "2026-04"
  revenue: number;
  expenses: number;
  netProfit: number;
}
```

---

## File Structure

```
src/
├── components/
│   └── reports/
│       ├── ProfitLossSummaryCards.tsx   # KPI cards: Pemasukan, Pengeluaran, Laba/Rugi
│       ├── ProfitLossChart.tsx          # Bar/line chart comparing revenue vs expenses
│       └── ProfitLossTable.tsx          # Monthly breakdown table
├── hooks/
│   └── useProfitLoss.ts                 # Aggregates sales + expenses data
└── pages/
    └── ReportsPage.tsx                  # Main report page
```

---

## Hook: `useProfitLoss.ts`

```ts
// src/hooks/useProfitLoss.ts
// Parameters: merchantId, year (number)
// Returns: { monthlySummaries, yearSummary, loading, error }
// - Fetches sales and expenses for the given year
// - Aggregates monthly revenue from sales subcollection
// - Aggregates monthly expenses from expenses subcollection
// - Calculates net profit per month and for the full year
```

**Implementation notes:**
- Fetch all sales date documents for the year using `where('date', '>=', startOfYear)` and `where('date', '<=', endOfYear)` — or filter by document ID prefix (e.g., `2026-`)
- Fetch all expenses with `date` in the same year range
- Aggregate by month (group by `YYYY-MM`)
- Return 12-month breakdown plus annual totals
- Use `getDocs` (not `onSnapshot`) since reports are read-only snapshots — can use `onSnapshot` if real-time updates are desired

---

## Components

### `ProfitLossSummaryCards.tsx`

Three summary cards for the selected period:

| Card | Value | Color |
|---|---|---|
| Total Pemasukan | Sum of all revenue | Green |
| Total Pengeluaran | Sum of all expenses | Red |
| Laba / Rugi Bersih | Revenue - Expenses | Green (profit) / Red (loss) |

### `ProfitLossChart.tsx`

- Grouped bar chart (Recharts `BarChart`) or combo line+bar chart
- X-axis: Months (Jan–Dec)
- Bars: Pemasukan (green) vs Pengeluaran (red)
- Line overlay (optional): Laba/Rugi Bersih
- Tooltip showing values in rupiah format

### `ProfitLossTable.tsx`

Monthly breakdown table:

| Bulan | Pemasukan | Pengeluaran | Laba / Rugi |
|---|---|---|---|
| Januari | Rp 2.500.000 | Rp 800.000 | Rp 1.700.000 |
| Februari | Rp 1.900.000 | Rp 1.200.000 | Rp 700.000 |
| ... | | | |
| **Total** | **Rp X** | **Rp X** | **Rp X** |

- Laba/Rugi column: green text for positive, red text for negative
- Bold total row at the bottom

---

## Page: `ReportsPage.tsx`

- **Route:** `/reports`
- **Accessible by:** Superadmin (all merchants), Admin Merchant (own merchant)
- Year selector (dropdown or input, defaults to current year)
- For Superadmin: merchant selector dropdown
- `ProfitLossSummaryCards` at the top
- `ProfitLossChart` in the middle
- `ProfitLossTable` at the bottom
- Loading skeletons while data is being fetched

---

## Routing

Add to `App.tsx`:

```tsx
<Route path="/reports" element={
  <RoleGuard allowedRoles={['superadmin', 'admin']}>
    <ReportsPage />
  </RoleGuard>
} />
```

---

## Sidebar Navigation

Add "Laporan" menu item to `Sidebar.tsx`:
- Icon: `FileBarChart` (lucide-react)
- Label: Laporan Laba Rugi
- Path: `/reports`
- Visible to: `superadmin`, `admin`

---

## Firebase Security Rules

No new rules required — this page reads from existing `sales` and `expenses` subcollections. Ensure Phase 7 rules (expenses) and existing sales rules are properly applied.

---

## Formatting Conventions

- Display all currency values in **Rupiah format**: `Rp 1.500.000`
- Use a `formatRupiah(amount: number): string` utility function in `src/lib/utils.ts`
- Negative net profit: prefix with `-` and display in red (e.g., `-Rp 200.000`)
- Store all amounts as integers in Firestore (no decimals)

---

## Acceptance Criteria

- [ ] Report page shows Pemasukan, Pengeluaran, and Laba/Rugi Bersih summary cards
- [ ] Monthly breakdown chart compares revenue vs expenses per month
- [ ] Monthly breakdown table lists all 12 months with totals
- [ ] Net profit/loss is calculated correctly as `revenue - expenses`
- [ ] Negative profit (rugi) is visually distinct (red color)
- [ ] Year selector filters data for the chosen year
- [ ] Superadmin can switch between merchants
- [ ] Admin Merchant sees data scoped to their own merchant
- [ ] Loading state is handled with skeleton components
- [ ] Currency values are formatted as Rupiah (integer, no decimals)

---

## Dependencies

- Phase 5 (Sales feature) must be complete — sales data is required
- Phase 7 (Expenses feature) must be complete — expense data is required

---

*Phase 8 — Profit & Loss Report (Laporan Laba Rugi)*
