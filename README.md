# Mobile Order — Plearn Kitchen

**v2 redesign (2026):** Blue / Indigo / Violet palette with cool slate
backgrounds, gradient icon containers (no emojis — Lucide icons throughout).

Restaurant Mobile Order system. See `SYSTEM_DESIGN.md` for full architecture.

> Built in parts. **Part 1** — Customer PWA. **Part 2** — POS + Kitchen Display.
> **Part 3** — Owner Console (Dashboard, P&L Reports, Menu/Tables/Expenses, Settings).

## Stack (current)

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3 + custom design tokens (Coral / Herb / Cream theme)
- Framer Motion (animations)
- Zustand (cart & order state, persisted to localStorage)
- IBM Plex Sans Thai + Bricolage Grotesque (display)

## Repo layout

```
mobile-order/
├── apps/
│   ├── customer/        # Part 1: Customer PWA (port 3000)
│   ├── pos/             # Part 2: POS + Kitchen Display (port 3001)
│   └── owner/           # Part 3: Owner Console (port 3002)
├── packages/            # (shared types/ui — coming in later parts)
├── pnpm-workspace.yaml
├── package.json
└── SYSTEM_DESIGN.md
```

## Run locally

```bash
# install once
pnpm install

# Customer PWA — http://localhost:3000
pnpm dev:customer

# POS + Kitchen — http://localhost:3001
pnpm dev:pos

# Owner Console — http://localhost:3002
pnpm dev:owner
```

Customer: open `http://localhost:3000` → tap "ลองใช้งานเดโม" → demo session at `/demo-session-token`.
POS: open `http://localhost:3001` → redirects to `/tables`. Use "จำลองเหตุการณ์" to push notifications.

## Part 1 — Customer App: what's done

- Landing page (scan QR explainer)
- Restaurant home with cover, branding, sticky category tabs, search, featured grid + per-category lists
- Menu detail with options (required / optional), quantity stepper, note to kitchen
- Cart with edit note, quantity, line-by-line delete, confirmation sheet
- My orders — multi-round orders, kitchen status auto-advances (mock)
- Bill summary — subtotal, service charge, VAT calculation, payment method picker
- Payment — fake Thai QR PromptPay screen with countdown, slip option, cash/card counter info, success receipt
- Call staff sheet — 5 options + free text, real-time-style toast
- Mobile-first, PWA-ready (`manifest.webmanifest` + icon), safe-area aware, dark backdrop sheets, smooth motion

## Part 2 — POS App: what's done

- Sidebar navigation + Topbar with notification bell (live unread count + pulse)
- Tables page — 20 tables across 4 zones, status filter, stat cards, click to open drawer
- Open table dialog — pick available table, guest count, Static/Dynamic QR
- Table detail drawer — session info, urgent banners (call staff / bill request), per-item status update (รอ → ครัวรับ → ทำ → พร้อม → เสิร์ฟ)
- Orders page — full list, filter by status, search by table/menu/ORD #
- Kitchen Display — auto-sized tickets with urgency ring (>7 min amber, >12 min coral pulse), per-item single-tap status advance
- Payments page — pending bill requests + recent payments log
- "จำลองเหตุการณ์" button — pushes a random mock notification to demonstrate real-time flow (will swap for Pusher subscription in Part 5)

## Part 3 — Owner Console: what's done

- Sidebar with branding + Pro plan card + 7 nav items
- **Dashboard** — today's stats (revenue/orders/active tables/pending orders),
  monthly sales line chart, P&L summary (Revenue → COGS → GP → Expenses →
  Net), top-5 menus horizontal bars, hourly heatmap
- **Menus** — list view with category tabs, search, availability toggle,
  cost vs price, monthly sold count
- **Categories** — drag-grip list with active toggle
- **Tables & QR** — grid by zone + side QR preview panel with download/print,
  free-sticker registration CTA
- **Expenses** — gradient hero card with total + per-category breakdown bars,
  recent entries table
- **Reports (P&L)** — 4 metric cards, daily trend line chart, formal
  P&L statement (revenue by category → COGS → gross profit → expenses
  by category → net profit), category & profit-by-menu bars
- **Settings** — tabs (ข้อมูลร้าน / Mobile Order / ภาษี & การเงิน), mode
  picker (Normal/Buffet), 5 mobile-order toggles, VAT/Service Charge,
  PromptPay number

All charts are pure SVG (no external deps), responsive, with formatted
฿k labels.

## Coming in next parts

- Part 4 — Laravel backend (migrations, controllers, API)
- Part 5 — Pusher real-time + GBPrimePay integration + Buffet mode
