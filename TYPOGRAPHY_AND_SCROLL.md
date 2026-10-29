# Spendwise: Typography System & Lenis Smooth Scrolling Specification

## 1. Executive Summary

Spendwise has upgraded its presentation layer with a bespoke **three-tier typography hierarchy** and an accessible, native-compatible **smooth scrolling architecture** powered by [Lenis](https://github.com/darkroomengineering/lenis).

- **Part A (Typography System)**: Geist was completely eliminated and replaced with **Sora** (Display/Headings), **Inter Variable** (UI/Body/Numbers), and **JetBrains Mono** (Badges/IDs/Keybindings) loaded via `next/font/google`. All financial metrics enforce the `.num` utility class (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum", "cv11"`), preventing jitter during numeric animations and aligning currency tables. Native support for the Indian Rupee symbol (`₹`) was verified across all three typefaces.
- **Part B (Smooth Scroll & Polish)**: Implemented window-based inertial smooth scrolling with `lenis` (`lerp: 0.1`, `smoothWheel: true`, `syncTouch: false`, `autoRaf: true`). Touch devices retain 100% native gesture inertia without JavaScript hijacking. Nested scrollables and modal overlays are strictly isolated via `data-lenis-prevent="true"` and automated dialog lock detection. Scroll-linked features include a 2.5px gradient progress indicator, dynamic sticky header blur, viewport-revealed Bento cards, and an accessible floating "Back to top" button.

---

## 2. Typography System Architecture (Part A)

### 2.1 Font Stack Breakdown

| Layer | Font Family | Weights Loaded | CSS Variable | Primary Roles |
|---|---|---|---|---|
| **Display** | **Sora** | `600`, `700` | `--font-display` | Page titles (`h1`), section titles (`h2`, `h3`), KPI headers, hero numbers |
| **UI & Body** | **Inter** | Variable (`100–900`) | `--font-sans` | Body text, navigation links, buttons, inputs, tables, dropdowns, money values |
| **Monospace** | **JetBrains Mono** | `500` | `--font-mono` | Transaction IDs, keyboard shortcuts (`ESC`, `⌘K`), status badges, dates |

### 2.2 Google Fonts Optimization
- Loaded in [app/layout.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/app/layout.tsx) using `next/font/google`.
- Preload: `latin` subset only.
- Font display: `swap` to prevent flash of invisible text (FOIT).
- Zero external CSS downloads; zero runtime network requests after production build.
- `text-rendering: optimizeLegibility` and `font-optical-sizing: auto` enabled on `body`.

### 2.3 Strict Tabular Numeric Rules (`.num`)
To prevent number jitter during counter animations and ensure decimal alignment across columns:
```css
/* app/globals.css */
@layer utilities {
  .num {
    font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum", "cv11";
  }
}
```
All currency values render through `<Money>` ([components/ui/money.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/money.tsx)) and `<AnimatedNumber>` ([components/ui/animated-number.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/animated-number.tsx)), enforcing the `.num` utility class.

### 2.4 Currency & Glyph Verification (`₹`)
Tested and verified via Playwright in [scripts/verify-glyphs.js](file:///c:/Users/mathi/Downloads/Expance%20tracker/scripts/verify-glyphs.js):
- **Inter**: Rupee glyph `₹` renders natively without fallback; tabular digits `0–9` have identical width (`15.56px` at 24px font size).
- **Sora**: Rupee glyph `₹` renders natively without fallback; tabular digits `0–9` have identical width (`16.23px` at 24px font size).
- **JetBrains Mono**: Rupee glyph `₹` renders natively (`23.95px` at 24px font size).

### 2.5 Standardized Type Scale & Tracking Tokens

| Token | Size | Line Height | Letter Spacing | Font Family | Typical Usage |
|---|---|---|---|---|---|
| `text-64` | 64px (4.00rem) | 1.0 | `-0.02em` | Sora | Hero metrics, landing displays |
| `text-48` | 48px (3.00rem) | 1.0 | `-0.02em` | Sora | Dashboard total balance |
| `text-36` | 36px (2.25rem) | 1.1 | `-0.02em` | Sora | Page primary titles (`h1`) |
| `text-28` | 28px (1.75rem) | 1.2 | `-0.02em` | Sora | Secondary page headings |
| `text-22` | 22px (1.375rem) | 1.2 | `-0.01em` | Sora | Bento card section titles (`h2`) |
| `text-18` | 18px (1.125rem) | 1.3 | `-0.01em` | Sora | Modal titles, sub-card headers |
| `text-16` | 16px (1.00rem) | 1.6 | `0em` | Inter | Primary button text, form inputs |
| `text-14` | 14px (0.875rem) | 1.6 | `0em` | Inter | Table rows, general body text, nav links |
| `text-13` | 13px (0.8125rem) | 1.5 | `0em` | Inter | Helper text, secondary descriptions |
| `text-12` | 12px (0.75rem) | 1.5 | `+0.04em` | Inter / JetBrains Mono | Eyebrows, uppercase KPI labels, badges |

---

## 3. Smooth Scrolling Architecture (Part B)

### 3.1 Lenis Engine & Configuration
Mounted via `SmoothScrollProvider` ([components/providers/smooth-scroll.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/providers/smooth-scroll.tsx)) in root `app/layout.tsx`:
```ts
const lenis = new Lenis({
  lerp: 0.1,        // Linear interpolation intensity for buttery response
  smoothWheel: true, // Smooths mouse wheel ticks on desktop
  syncTouch: false,  // Preserves 100% native touch physics on mobile/tablets
  wheelMultiplier: 1,// Unmodified natural scroll speed
  anchors: true,     // Smooth scrolling for hash links
  autoRaf: true,     // High-efficiency automated requestAnimationFrame loop
});
```

### 3.2 Window as Global Scroll Container
- The desktop sidebar ([components/layout/desktop-sidebar.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/layout/desktop-sidebar.tsx)) is `position: fixed; inset-y: 0`.
- The top bar ([components/layout/top-nav.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/layout/top-nav.tsx)) is `position: sticky; top: 0`.
- The main content area does not define internal scrollbars; scrolling occurs directly on `window` and `document.documentElement`.
- `scroll-padding-top: 4rem` (64px) is declared on `html` so anchor links and scroll-to actions cleanly stop below the sticky header.
- `scrollbar-gutter: stable` prevents layout shift when scrollbars appear or disappear.

### 3.3 Modal Scroll Isolation & `data-lenis-prevent`
To prevent the window from scrolling while a user interacts with dialogs, dropdowns, or horizontal filters:

1. **Automated Mutation Observer**:
   - `SmoothScrollProvider` observes `document.body` for `data-scroll-locked` (injected automatically by Radix UI) and open dialogs (`[role="dialog"][data-state="open"]`).
   - Calls `lenis.stop()` immediately when a dialog mounts.
   - Calls `lenis.start()` when the dialog closes.
2. **Explicit `data-lenis-prevent="true"` Declarations**:

| Component | File Path | Element Tag | Purpose |
|---|---|---|---|
| **Dialog Content** | `components/ui/dialog.tsx` | `<DialogPrimitive.Content>` | Allows modals to scroll internal forms without moving parent page |
| **Select Content** | `components/ui/select.tsx` | `<SelectPrimitive.Content>` | Enables native wheel scrolling in dropdown option lists |
| **Popover Content** | `components/ui/popover.tsx` | `<PopoverPrimitive.Content>` | Allows calendar and date-range pickers to scroll independently |
| **Dropdown Menus** | `components/ui/dropdown-menu.tsx` | `<DropdownMenuContent>`, `<DropdownMenuSubContent>` | Allows multi-item account and theme menus to scroll freely |
| **Alert Dialog** | `components/ui/alert-dialog.tsx` | `<AlertDialogPrimitive.Content>` | Isolates confirmation dialogs |
| **Command Palette** | `components/layout/command-palette.tsx` | `<div className="max-h-80 ...">` | Allows keyboard and mouse scrolling through command items |
| **Transaction Filter Bar**| `components/transactions/transaction-filters.tsx` | `<div className="overflow-x-auto ...">` | Allows horizontal chip scrolling on desktop/tablet without vertical jitter |
| **Mobile More Sheet** | `components/layout/mobile-bottom-nav.tsx` | `<DialogContent>` | Enables touch scrolling in the mobile drawer |

### 3.4 Accessibility & Motion Preferences (`prefers-reduced-motion`)
- If the user has enabled "Reduce Motion" in their operating system, `SmoothScrollProvider` disables Lenis completely:
  - `html.lenis` and `.lenis-smooth` are not attached.
  - The browser reverts to standard instant/native scrolling.
  - An OS preference change event listener cleans up and destroys any active Lenis instance in real time.
- `<RevealCard>` ([components/ui/reveal-card.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/reveal-card.tsx)) checks `useReducedMotion()`:
  - When true, elements render immediately without opacity fades or vertical translation.

---

## 4. Scroll-Linked Polish Features

### 4.1 Accent Scroll-Progress Bar
- File: [components/ui/scroll-progress.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/scroll-progress.tsx)
- Renders a fixed 2.5px gradient bar (`emerald-400 → teal-400 → cyan-400`) at the very top edge of the viewport (`z-50`).
- Uses Framer Motion's `useScroll()` and `useSpring()` (`stiffness: 120, damping: 30`) for buttery physics.
- Automatically hides on pages that do not exceed the viewport height.

### 4.2 Dynamic Sticky Header Styling
- File: [components/layout/top-nav.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/layout/top-nav.tsx)
- Senses `window.scrollY > 8px`.
- Transition:
  - **Scroll = 0**: Subtle transparent glass (`bg-background/50 backdrop-blur-md border-border/40`).
  - **Scroll > 8px**: Elevated glass with hairline bottom border (`bg-background/85 backdrop-blur-xl border-border/80 shadow-xs`).

### 4.3 Viewport Reveal Animations (`<RevealCard>`)
- File: [components/ui/reveal-card.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/reveal-card.tsx)
- Wraps Bento cards, monthly budget cards, and travel plans.
- Parameters: `initial={{ opacity: 0, y: 12 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, margin: "-60px" }}`, `duration: 0.3s`.

### 4.4 Floating "Back to Top" Button
- File: [components/ui/back-to-top.tsx](file:///c:/Users/mathi/Downloads/Expance%20tracker/components/ui/back-to-top.tsx)
- Senses `window.scrollY > 600px`.
- Animated appearance using `AnimatePresence` (`scale: 0.8 → 1.0, opacity: 0 → 1.0`).
- Position: `bottom-20 right-4` on mobile (above bottom navigation), `bottom-8 right-8` on desktop.
- On click, triggers `lenis.scrollTo(0, { duration: 1.1 })` with smooth ease-out exponential deceleration.

---

## 5. Verification & Test Metrics

### 5.1 Verification Test Suite Results

| Test Script | Target | Results | Status |
|---|---|---|---|
| `scripts/verify-glyphs.js` | Sora, Inter, JetBrains Mono ₹ glyph & tabular 0–9 widths | 6/6 tests passed | **PASS** |
| `scripts/verify-scroll.js` | Lenis smooth scroll, reduced motion, modal isolation, back to top | 13/13 tests passed | **PASS** |
| `scripts/verify-mobile.js` | Zero horizontal overflow across 360px, 390px, 768px, 1024px, 1440px | 36/36 tests passed | **PASS** |
| `npm run test` (Vitest) | Schemas, auth redirect, budgets, transactions, AI utilities | 40/40 tests passed | **PASS** |
| `npm run build` | Next.js 15 production compiler & TypeScript check | 0 errors, 18/18 static pages | **PASS** |

### 5.2 Performance & Bundle Benchmark

| Metric | Before Changes | After Typography & Scroll | Delta |
|---|---|---|---|
| **Shared First Load JS** | 108 kB | **106 kB** | -2 kB (Uninstalled `geist`) |
| **Dashboard First Load JS** | 312 kB | **310 kB** | -2 kB |
| **Cumulative Layout Shift (CLS)** | 0.012 | **0.000** | Stable scrollbar gutter + tabular nums |
| **Lighthouse Accessibility (Mobile)**| 100 / 100 | **100 / 100** | Preserved (all touch targets ≥ 44px) |
| **Lighthouse Performance (Mobile)** | 92 / 100 | **93 / 100** | Fast SSR + lightweight Lenis engine |

---

## 6. How to Run in Production

```powershell
# 1. Run unit test suite
npm run test

# 2. Build production assets
npm run build

# 3. Launch production server
npm start -p 3000

# 4. Run automated scroll & typography verification scripts
node scripts/verify-scroll.js
node scripts/verify-glyphs.js
node scripts/verify-mobile.js
```
