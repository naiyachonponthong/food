# Mobile Order — Plearn Kitchen

Restaurant Mobile Order system. See `SYSTEM_DESIGN.md` for full architecture.

> Built in parts. **Part 1** — Customer App (PWA). **Part 2** — POS App (Staff + Kitchen Display).

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
│   └── pos/             # Part 2: POS + Kitchen Display (port 3001)
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

## Coming in next parts

- Part 3 — Owner app (dashboard, menu/table/package management, expenses, P&L)
- Part 4 — Laravel backend (migrations, controllers, API)
- Part 5 — Pusher real-time + GBPrimePay integration
