# Mobile Order — Plearn Kitchen

Restaurant Mobile Order system. See `SYSTEM_DESIGN.md` for full architecture.

> Built in parts. **Part 1 (this commit)** — Customer App (PWA) with mock data, no backend yet.

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
│   └── customer/        # ← Part 1: Customer PWA
├── packages/            # (shared types/ui — coming in later parts)
├── pnpm-workspace.yaml
├── package.json
└── SYSTEM_DESIGN.md
```

## Run locally

```bash
# install once
pnpm install

# start customer app on http://localhost:3000
pnpm dev
```

Open `http://localhost:3000` → tap "ลองใช้งานเดโม" → you'll be sent to a demo session token at `/demo-session-token`.

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

## Coming in next parts

- Part 2 — POS app (tables grid, order management, kitchen display, real-time notifications)
- Part 3 — Owner app (dashboard, menu/table/package management, expenses, P&L)
- Part 4 — Laravel backend (migrations, controllers, API)
- Part 5 — Pusher real-time + GBPrimePay integration
