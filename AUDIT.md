# Spendwise — Comprehensive Frontend, Performance & Mobile Audit (Phase 0)

Audit timestamp: 2026-10-29T14:54:00+05:30  
Target: **Next.js 15.1.4 Production Build (`next build && next start -p 3000`)**  
Environment: Node.js v24.20.0, Windows 11, Chromium (Playwright)

---

## 1. Production Bundle Analysis (Route-by-Route First Load JS)

Extracted directly from the optimized Next.js 15 production build manifest:

| Route | Route Type | Route Size | First Load JS Bundle |
| :--- | :--- | :--- | :--- |
| **`/` (Dashboard)** | Server (Dynamic `ƒ`) | 167 B | **305 kB** |
| **`/dashboard`** | Server (Dynamic `ƒ`) | 167 B | **305 kB** |
| **`/transactions`** | Client (Static `○`) | 6.14 kB | **302 kB** |
| **`/budgets`** | Client (Static `○`) | 8.33 kB | **304 kB** |
| **`/trips`** | Client (Static `○`) | 2.81 kB | **305 kB** |
| **`/trips/[id]`** | Server (Dynamic `ƒ`) | 5.81 kB | **308 kB** |
| **`/settings`** | Client (Static `○`) | 6.17 kB | **302 kB** |
| **`/login`** | Client (Static `○`) | 4.69 kB | **264 kB** |
| **`/signup`** | Client (Static `○`) | 5.30 kB | **265 kB** |
| **`/forgot-password`** | Client (Static `○`) | 5.11 kB | **257 kB** |
| **`/reset-password`** | Client (Static `○`) | 190 B | **257 kB** |
| **Middleware** | Edge / Node Middleware | 92 kB | - |
| **Shared by all routes** | Shared Core Chunks | - | **106 kB** |

---

## 2. Baseline Lighthouse Scores (Mobile Profile)

Audited via Google Lighthouse 13.6.0 mobile emulation (`--form-factor=mobile`, throttled CPU & 4G network):

| Category | Baseline Score | Target Score | Primary Issues Identified |
| :--- | :--- | :--- | :--- |
| **Performance** | **73 / 100** | **90+** | Total Blocking Time (TBT = 1,130ms), CLS (0.118), Unused JS (111 KiB), Max Potential FID (440ms) |
| **Accessibility** | **94 / 100** | **95+** | Touch targets < 48x48px on compact buttons; document missing explicit `<main>` landmark in auth views |

---

## 3. Baseline Navigation & Click-to-Render Latency (Production Build)

Measured using Playwright end-to-end automation across 3 target viewports (375px, 768px, 1440px):

| Navigation Transition | 375px (Mobile) | 768px (Tablet) | 1440px (Desktop) | Root Cause for Perceived Slowness |
| :--- | :--- | :--- | :--- | :--- |
| **Cold Dashboard Load** | 1,847 ms | 1,381 ms | 1,817 ms | Client waterfall fetching summary, transactions, and budgets sequentially |
| **Dashboard → Transactions** | 987 ms | 942 ms | 845 ms | `AppShell` unmounts and remounts entirely; table re-renders from empty |
| **Transactions → Budgets** | 900 ms | 846 ms | 775 ms | Re-instantiating sidebar, top-nav, user menu; missing `loading.tsx` skeleton |
| **Budgets → Trips** | 811 ms | 789 ms | 720 ms | No hover/focus prefetching on navigation links |
| **Trips → Settings** | 943 ms | 847 ms | 823 ms | Client component fetches user profile via multiple DOM cookie lookups |

---

## 4. Layout Bugs, Console Errors & Hydration Issues (Ranked by Impact)

### 🔴 Critical Impact (P0)
1. **Unmounted/Remounted Shell on Route Changes**:  
   `AppShell` is declared inside every single page (`app/page.tsx`, `app/transactions/page.tsx`, `app/budgets/page.tsx`, `app/trips/page.tsx`, `app/settings/page.tsx`). Each page click completely destroys and recreates the `DesktopSidebar`, `TopNav`, and `MobileBottomNav`, causing harsh visual flashing, losing scroll states, and introducing 800ms+ latency.
2. **Horizontal Overflow on Transactions Page**:  
   At 1440px and 768px, the date range input and filter pill container exceed the bounds of the card (`txHasOverflow: true`), clipping the "Reset" button and causing unwanted horizontal scrolling.
3. **Cumulative Layout Shift (CLS = 0.118)**:  
   Missing `scrollbar-gutter: stable`. On pages with shorter content, the vertical scrollbar vanishes, shifting all centered elements and top-nav avatars 16px to the right.

### 🟡 High Impact (P1)
4. **Login Page Button Overlap & Cramped UX**:  
   "Instant Demo Access" and "New User Access" buttons are placed in a 2-column grid with long text. At mobile (<420px) and tablet widths, the text wraps awkwardly, icons overlap button borders, and the buttons look broken.
5. **AI Insight vs Dashboard Data Discrepancy**:  
   When a user has ₹0 recorded transactions, the dashboard summary cards show ₹0 income and ₹0 expenses, but the AI insight component fallback displays hardcoded figures claiming ₹82,911 saved with a 47.8% savings rate.
6. **Mobile Table Degradation**:  
   The Transactions ledger renders an unpadded `<table>` on mobile screens (375px), forcing horizontal scroll or cutting off category tags, payment methods, and action buttons.
7. **Floating Quick-Add Overlap**:  
   The floating "+" button is fixed at `bottom-6 right-6`, which collides with the mobile bottom navigation bar (`MobileBottomNav`) on screens under 768px, blocking bottom tab taps.

### 🟢 Medium Impact (P2)
8. **Settings Mock Session Artifact**:  
   When authenticated via email/password or demo session, Settings displays static "Google User / google.user@spendwise.app" in several mock states rather than dynamically reflecting real Supabase session data with a prominent "Demo Mode" badge.
9. **Touch Target Size Violations**:  
   Several interactive buttons, close icons, and filter chips are 32px or 36px tall, violating WCAG / Lighthouse 44px+ mobile touch target rules.
10. **Accessibility Landmark Missing**:  
    Auth cards (`/login`, `/signup`, `/forgot-password`, `/reset-password`) are contained in generic `<div>` wrappers without a `<main>` semantic landmark.

---

## 5. Visual Evidence Archive

Baseline screenshots captured at 375px, 768px, and 1440px in `/audit/before/`:
- `audit/before/login-375px.png`, `login-768px.png`, `login-1440px.png`
- `audit/before/signup-375px.png`, `signup-768px.png`, `signup-1440px.png`
- `audit/before/dashboard-375px.png`, `dashboard-768px.png`, `dashboard-1440px.png`
- `audit/before/transactions-375px.png`, `transactions-768px.png`, `transactions-1440px.png`
- `audit/before/budgets-375px.png`, `budgets-768px.png`, `budgets-1440px.png`
- `audit/before/trips-375px.png`, `trips-768px.png`, `trips-1440px.png`
- `audit/before/settings-375px.png`, `settings-768px.png`, `settings-1440px.png`

---

## 6. Action Plan for Subsequent Phases

- **Phase 1**: Fix observed layout bugs (login button stacking, transactions filter wrap, stable scrollbar container, data consistency in AI insights, demo mode banner).
- **Phase 2**: Move `AppShell` into a persistent Next.js layout structure to eliminate remounts; add route-level `loading.tsx` skeletons; prefetch on hover; optimize query staleTimes; add missing database indexes.
- **Phase 3**: Modern fintech UI redesign with refined design tokens, Linear/Stripe styling, tabular numbers, sparklines, and polished dark/light themes.
- **Phase 4**: True mobile-first responsiveness (360px–1440px), responsive bottom nav with center Quick-Add, bottom sheets/drawers for forms, table-to-card mobile transforms.
- **Phase 5**: Re-measure production performance, capture `/audit/after/` screenshots, run all automated test suites, and deliver final engineering report.

