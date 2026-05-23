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
├── backend/             # Part 4: Laravel 13 API (port 8000)
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

# Laravel API — http://localhost:8000
cd backend
php artisan migrate:fresh --seed   # one-time
php artisan serve
```

**Seeded login:** `owner@plearn.test` / `password` (also `staff@…` and `kitchen@…`).

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

## Part 4 — Laravel Backend: what's done

- Laravel 13 + PHP 8.4 + SQLite (HostAtom MySQL-compatible schema).
- Sanctum bearer-token auth, role on the token's abilities.
- 13 migrations / 18 tables matching SYSTEM_DESIGN sec 6
  (restaurants, restaurant_settings, users, menu_categories, menus,
  menu_options, menu_option_choices, packages, package_items,
  package_addons, tables, table_sessions, orders, order_items,
  order_item_options, payments, expense_categories, expenses,
  notifications) — all UUID PKs.
- 18 Eloquent models with relationships + casts.
- 13 controllers: Auth, Restaurant, MenuCategory, Menu, Table,
  Session, Order, Kitchen, Payment, Notification, Expense, Dashboard,
  Public/Customer.
- Services: `QrCodeService` (endroid/qr-code → data URI),
  `OrderCalculatorService` (Normal + Buffet bill math, applies
  service charge + VAT from restaurant settings).
- **69 API routes** under `/api/v1` covering Auth, Restaurant,
  Menus, Categories, Tables (incl. QR generation), Sessions
  (open/timer/extend/close/summary), Orders, Kitchen queue,
  Payments (cash/QR/slip/verify), Notifications, Expenses,
  Dashboard (summary/sales/top-menus/P&L/hourly), and the public
  customer endpoints `/public/{token}/...`.
- Seeder builds "ครัวเพลิน": 17 menus / 7 categories, 20 tables,
  2 buffet packages with items + addons, 7 expense categories with
  sample entries, 3 user logins.

End-to-end test passes from staff login → open session → customer
fetches menus → places order → calls staff → kitchen queue shows
the order → bill total computes correctly with service charge + VAT.

## Part 5 — Real-time + Buffet Timer + API client: what's done

- Broadcasting wired into `bootstrap/app.php` via `withBroadcasting()`
  with channels in `routes/channels.php` (`restaurant.{id}` /
  `kitchen.{id}` private, `table.{token}` presence).
- BROADCAST_CONNECTION=log + QUEUE_CONNECTION=sync so every event
  appears in `storage/logs/laravel.log` immediately — swap to
  `pusher` + real keys in `.env` for production and Pusher receives
  the exact same payload.
- 5 event classes under `App\Events`:
  - `NewOrderEvent` (broadcast as `new-order` → restaurant + kitchen)
  - `CallStaffEvent` (`call-staff` → restaurant)
  - `BillRequestEvent` (`bill-request` → restaurant)
  - `OrderStatusChangedEvent` (`order-{status}` → restaurant +
    presence-table)
  - `TimerEvent` — one class with four `broadcastAs()` variants:
    `last-order-warning` / `timer-warning` / `timer-expired` /
    `time-extended`, broadcast on all three channels at once.
- Controllers wired:
  - `OrderController::place` and `updateStatus` broadcast their events
    plus log a `Notification` record for the dropdown.
  - `Public\CustomerController::callStaff` and `requestBill` broadcast
    + persist notifications.
- **Buffet timer cron** — `php artisan buffet:check-timers` polls all
  active buffet sessions every minute (via `Schedule::command(...)
  ->everyMinute()` in `routes/console.php`), fires `last-order-warning`
  when `last_order_at` is past, `timer-warning` when ≤10 min remaining,
  `timer-expired` when past `expires_at`. Uses the notifications log
  to deduplicate so the same alert won't fire twice.
- **Sessions cleanup** — `php artisan sessions:cleanup` (nightly at
  02:00) expires zombie sessions that ran 2+ hours past their
  `expires_at` and never closed properly.

API clients in each frontend app:
- `apps/customer/lib/api.ts` — public token endpoints (restaurant,
  menus, package, my-orders, place-order, call-staff, bill).
- `apps/pos/lib/api.ts` — bearer-token auth with localStorage,
  tables / sessions / orders / kitchen / payments / notifications.
- `apps/owner/lib/api.ts` — dashboard / menus / categories / tables /
  expenses / settings.

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (default) to
point the frontends at the Laravel backend.

End-to-end smoke test:
```
# Trigger a customer call-staff → see it broadcast immediately
curl -X POST http://localhost:8000/api/v1/public/$TOKEN/call-staff \
  -d '{"reason":"ขอเครื่องปรุง"}'
tail storage/logs/laravel.log | grep Broadcasting
# → Broadcasting [call-staff] on channels [private-restaurant.…]
```
