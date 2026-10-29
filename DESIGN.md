# Spendwise — "Dark-First Premium Fintech" Design System

## 1. Design Direction & Ethos
- **Inspiration**: Linear, Revolut, Vercel dashboard.
- **Philosophy**: Dark-first, deep surfaces, hairline borders, single confident emerald/teal accent, expressive display numbers with tight tracking, layered soft glows, and generous breathing room. Light mode is crafted with matching deliberate contrast, not an unstyled negative inversion.
- **Surface Integrity**: Solid, opaque card backgrounds with hairline borders (`rgba(255,255,255,0.08)` / `rgba(15,23,42,0.08)`). `backdrop-blur` glass is restricted exclusively to floating elements (top navigation bar, floating mobile bottom navigation, command palette, popovers).

---

## 2. Color Palette & Design Tokens

### Dark Theme (Default)
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--background` | `#0A0D12` (`hsl(220, 29%, 5.5%)`) | Canvas background |
| `--surface` | `#11151C` (`hsl(218, 24%, 9%)`) | Base cards, sidebar, table containers |
| `--surface-elevated` | `#171C25` (`hsl(219, 23%, 12%)`) | Floating panels, dropdowns, hovered items |
| `--border` | `rgba(255, 255, 255, 0.08)` | Hairline surface separators |
| `--text` / `--foreground` | `#E8ECF2` | Primary high-contrast text |
| `--muted` / `--text-muted` | `#8B95A7` | Secondary labels, timestamps, metadata |
| `--inner-highlight` | `inset 0 1px 0 rgba(255,255,255,0.05)` | Subtle depth bevel on card tops |

### Light Theme
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--background` | `#F5F6F8` (`hsl(220, 14%, 97%)`) | Canvas background |
| `--surface` | `#FFFFFF` (`hsl(0, 0%, 100%)`) | Base cards, sidebar, table containers |
| `--surface-elevated` | `#FFFFFF` | Floating panels, dropdowns |
| `--border` | `rgba(15, 23, 42, 0.08)` | Hairline surface separators |
| `--text` / `--foreground` | `#0F172A` | Primary high-contrast text |
| `--muted` / `--text-muted` | `#64748B` | Secondary labels, timestamps, metadata |
| `--inner-highlight` | `inset 0 1px 0 rgba(255,255,255,0.8)` | Subtle top border highlight |

### Accent & Semantic Accents
| Token | Gradient / Hex | Semantic Role |
| :--- | :--- | :--- |
| **Brand Accent** | `linear-gradient(135deg, #34D399 0%, #22D3EE 100%)` | Primary CTAs, active indicators, focus rings |
| **Accent Solid** | `#10B981` / `#34D399` | Primary single-color points |
| **Income / Credit** | `#34D399` (Mint) | Inflows, positive deltas, surplus states |
| **Expense / Outflow**| `#FB7185` (Rose) | Outflows, negative deltas, deficit states |
| **Warning / Alert** | `#FBBF24` (Amber) | 80% budget limit warnings, demo notices |
| **Info / Active** | `#38BDF8` (Sky) | Secondary filters, trip indicators |

---

## 3. Border Radii & Elevation Scale

- **Inputs, Buttons, Badges**: `12px` (`rounded-xl`)
- **Standard Cards, Tables, Skeletons**: `20px` (`rounded-[20px]`)
- **Hero Banners, Dialogs, Bento Cards**: `28px` (`rounded-[28px]`)
- **Elevations & Glows**:
  - `shadow-glow-accent`: `0 0 24px -4px rgba(52, 211, 153, 0.25)`
  - `shadow-glow-rose`: `0 0 24px -4px rgba(251, 113, 133, 0.2)`
  - `shadow-card`: `0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)`

---

## 4. Typography Scale

- **Font Families**:
  - **Display (Page titles, hero numbers, section headings)**: `Sora` (`var(--font-display)`), weights 600, 700
  - **UI & Body (Nav, buttons, forms, tables, paragraphs)**: `Inter` (`var(--font-sans)`), variable font
  - **Mono (Tiny labels, codes, kbd shortcuts)**: `JetBrains Mono` (`var(--font-mono)`), weight 500
- **Rules**:
  - **ALL money and numeric data use Inter with `.num`** (`font-variant-numeric: tabular-nums` and `font-feature-settings: "tnum", "cv11"`).
  - Type scale: `12` / `13` / `14` / `16` / `18` / `22` / `28` / `36` / `48` / `64`.
  - Line heights: 1.6 body, 1.2 headings, 1.0 display numbers.
  - Letter-spacing: `-0.02em` for display, `-0.01em` for headings, `0` for body, `+0.04em` with uppercase for tiny labels (`tracking-eyebrow`).
  - No filler taglines under page titles. Keep headings concise, crisp, and confident.
- **Scale**:
  - `11px`: Tiny tags, micro metadata
  - `12px`: Secondary labels, table column headers, helper text
  - `14px`: Body text, input text, table cell data, buttons
  - `16px`: Card subtitles, list item titles, modal headings
  - `20px`: Section titles, budget names, trip destinations
  - `28px`: Page titles, secondary hero figures
  - `40px`–`52px`: Hero balance, primary KPI stats

---

## 5. Universal Category Icon & Color Registry

All category icons use `lucide-react` with `strokeWidth={1.75}` and size `18px–20px`. Icons render inside soft tinted circular chips (`bg-[color]/12` background with `text-[color]`).

| Category Name / Key | Hex Color | Lucide Icon | Tint Background |
| :--- | :--- | :--- | :--- |
| **Food & Dining** | `#F59E0B` | `Utensils` | `rgba(245, 158, 11, 0.12)` |
| **Shopping** | `#EC4899` | `ShoppingBag` | `rgba(236, 72, 153, 0.12)` |
| **Housing & Rent** | `#6366F1` | `Home` | `rgba(99, 102, 241, 0.12)` |
| **Transportation** | `#3B82F6` | `Car` | `rgba(59, 130, 246, 0.12)` |
| **Entertainment** | `#8B5CF6` | `Film` | `rgba(139, 92, 246, 0.12)` |
| **Health & Fitness**| `#10B981` | `HeartPulse` | `rgba(16, 185, 129, 0.12)` |
| **Travel & Vacation**| `#06B6D4` | `Plane` | `rgba(6, 182, 212, 0.12)` |
| **Utilities & Bills**| `#EAB308` | `Zap` | `rgba(234, 179, 8, 0.12)` |
| **Salary & Income** | `#34D399` | `ArrowUpRight` | `rgba(52, 211, 153, 0.12)` |
| **Investment** | `#14B8A6` | `TrendingUp` | `rgba(20, 184, 166, 0.12)` |
| **Freelance** | `#A855F7` | `Briefcase` | `rgba(168, 85, 247, 0.12)` |
| **Other / General** | `#64748B` | `MoreHorizontal` | `rgba(100, 116, 139, 0.12)` |

---

## 6. Shared Component Inventory

1. `Button`: Primary gradient (`from-emerald-400 to-cyan-400`), secondary surface, ghost, destructive. Scale on active: `active:scale-[0.98]`.
2. `Card`: Variants `default`, `surface`, `elevated`, `gradient-border`.
3. `CategoryIcon`: Universal chip renderer taking category name/color/icon.
4. `Money`: Indian currency formatter (`₹` prefix, Lakh/Crore grouping, `tabular-nums`, optional sign & semantic color).
5. `AnimatedNumber`: Smooth count-up on load honoring `prefers-reduced-motion`.
6. `SegmentedControl`: Animated sliding pill indicator for month/year and filters.
7. `ProgressRing`: SVG circular ring with 20% savings threshold tick.
8. `CommandPalette`: Keyboard-navigable (`⌘K` / `Ctrl+K`) jump menu and quick actions.
9. `EmptyState`: Custom inline SVG illustrations with 3-step onboarding checklist for empty states.
10. `Dialog / Drawer`: Desktop centered modal with hairline border, mobile smooth bottom sheet.

---

## 7. Motion & Micro-Interactions

- All transitions capped at `180ms–220ms` with `ease-out`.
- Card hover: `translateY(-2px)` + subtle border glow.
- Staggered entrance for dashboard bento cards: `40ms` delay increments via framer-motion.
- Full respect for `@media (prefers-reduced-motion: reduce)`.

