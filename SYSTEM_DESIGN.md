# Mobile Order System — Complete System Design

> Restaurant mobile ordering via QR Code (Static & Dynamic) for Thai restaurants.  
> Hosted on **HostAtom Shared Hosting** (PHP + MySQL) with **Pusher** for real-time features.  
> รองรับทั้ง **ร้านอาหารทั่วไป** และ **ชาบู/บุฟเฟ่ต์** — เลือก Mode ตอนตั้งค่าร้าน

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Tech Stack](#2-tech-stack)
3. [User Roles](#3-user-roles)
4. [Restaurant Mode](#4-restaurant-mode)
5. [Modules](#5-modules)
6. [Database Schema](#6-database-schema)
7. [API Routes](#7-api-routes)
8. [Real-time Events (Pusher)](#8-real-time-events-pusher)
9. [QR Code Flow](#9-qr-code-flow)
10. [Payment Flow](#10-payment-flow)
11. [Project Structure](#11-project-structure)
12. [Environment Variables](#12-environment-variables)
13. [Deployment Guide (HostAtom)](#13-deployment-guide-hostatom)

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────┐
│              HostAtom Shared Hosting                 │
│                                                      │
│   Laravel 11 (PHP 8.2)                               │
│   ├── REST API (all modules)                         │
│   ├── QR Code Generator (endroid/qr-code)            │
│   ├── File Upload (menu images, logos)               │
│   └── MySQL 8.0 (all data)                           │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP Push (trigger events)
┌────────────────────────▼─────────────────────────────┐
│                  Pusher (Free Tier)                  │
│   Real-time WebSocket layer                          │
│   ├── New order notifications                        │
│   ├── Order status updates                           │
│   ├── Staff call alerts                              │
│   ├── Bill request alerts                            │
│   └── Timer alerts (ชาบู)                           │
└────────────────────────┬─────────────────────────────┘
                         │ Subscribe (JS SDK)
┌────────────────────────▼─────────────────────────────┐
│            Next.js 14 (Static Export)                │
│                                                      │
│   /customer  → ลูกค้า scan QR สั่งอาหาร (PWA)       │
│   /pos       → พนักงาน + ครัว (POS display)         │
│   /owner     → เจ้าของร้าน ตั้งค่า + Dashboard      │
└──────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer          | Technology                    | Reason                                      |
|----------------|-------------------------------|---------------------------------------------|
| Backend        | Laravel 11 (PHP 8.2)          | Runs on shared hosting, full-featured       |
| Database       | MySQL 8.0                     | Available on HostAtom, unlimited DBs        |
| Real-time      | Pusher (Free: 200 conn/day)   | WebSocket without running daemon            |
| Frontend       | Next.js 14 + TypeScript       | Static export, PWA support                  |
| UI Components  | shadcn/ui + Tailwind CSS      | Fast dev, mobile-first                      |
| QR Generator   | endroid/qr-code (PHP)         | Server-side QR, PDF export                  |
| Auth           | Laravel Sanctum (JWT)         | Stateless, multi-device                     |
| Payment        | GBPrimePay / PromptPay QR     | Thai payment standard                       |
| File Storage   | HostAtom local storage        | Images stored on same server                |
| Monorepo       | Turborepo                     | Manage 3 frontend apps + shared packages    |

---

## 3. User Roles

| Role      | Thai           | Permissions                                               |
|-----------|----------------|-----------------------------------------------------------|
| `owner`   | เจ้าของร้าน    | Full access: settings, reports, all modules               |
| `manager` | ผู้จัดการ      | All except billing/subscription settings                  |
| `cashier` | แคชเชียร์      | Orders, payments, table management                        |
| `waiter`  | พนักงานเสิร์ฟ  | Open/close tables, view orders, mark served               |
| `kitchen` | ครัว           | View kitchen queue only, update item status               |

---

## 4. Restaurant Mode

ตั้งค่าใน `restaurant_settings.mode` — มี 2 โหมด:

| Mode        | ค่า           | ใช้สำหรับ                                         |
|-------------|---------------|---------------------------------------------------|
| Normal      | `normal`      | ร้านอาหารทั่วไป สั่งอาหาร a la carte             |
| Buffet      | `buffet`      | ชาบู / บุฟเฟ่ต์ มี Package + Timer + Refill      |

### ความแตกต่างหลักระหว่าง 2 โหมด

| Feature            | Normal Mode             | Buffet Mode                           |
|--------------------|-------------------------|---------------------------------------|
| การคิดราคา         | Per item                | Per person × Package                  |
| การสั่งซ้ำ         | คิดราคาทุกครั้ง         | Refill ฟรีในขอบเขต Package            |
| Timer              | ไม่มี                   | มี (90–120 นาที)                       |
| Last Order Alert   | ไม่มี                   | มี (แจ้งก่อนหมดเวลา N นาที)           |
| QR Type            | Static หรือ Dynamic     | Dynamic เท่านั้น                       |
| จำนวนคน            | Optional                | บังคับ (ผู้ใหญ่ / เด็ก)              |
| เมนู               | a la carte              | Package items + Add-on                |

---

## 5. Modules

### 5.1 Auth Module
- Login with email + password → returns Sanctum token
- Refresh token
- Logout (revoke token)
- Get current user profile
- Update profile / change password

### 5.2 Restaurant Module
- CRUD restaurant profile (name, logo, cover image, address, tax ID)
- Update settings (VAT, service charge, theme color, PromptPay number)
- **Set restaurant mode: `normal` / `buffet`**
- Upload logo + cover image
- Set featured menus (max 6)
- Toggle: auto confirm, kitchen print, slip verify, call staff, self checkout
- Set call staff options (เครื่องปรุง, อุปกรณ์, เครื่องดื่ม, etc.)

### 5.3 Menu Module
- **Categories:** CRUD, sort order, active/inactive
- **Menu Items:** CRUD, price, **cost (ต้นทุน)**, calories, image, tags, featured flag
- **Options:** Add option groups per item (e.g. ระดับความเผ็ด, เพิ่มท็อปปิ้ง)
- **Option Choices:** Each option has choices with price add-on
- Toggle availability (หมดชั่วคราว)
- Bulk import/export (CSV)
- **[Buffet] ระบุว่าเมนูเป็น Package item / Add-on / ทั้งสองอย่าง**

### 5.4 Package Module *(Buffet Mode only)*
- CRUD Package (ชื่อ, ราคาผู้ใหญ่, ราคาเด็ก, ระยะเวลา นาที)
- กำหนด Last Order threshold (เช่น 15 นาที ก่อนหมดเวลา)
- เลือกเมนูที่รวมอยู่ใน Package (`package_items`)
- เพิ่มเมนู Add-on คิดเงินพิเศษ (`package_addons`)
- ตั้งค่าต่อเวลา: ราคา + จำนวนนาที

### 5.5 Table Module
- CRUD tables with zone grouping
- Set QR type per table: `static` หรือ `dynamic`
- **[Buffet] บังคับ `dynamic` เท่านั้น**
- Generate Static QR → permanent URL → export PDF/PNG
- View table status: ว่าง / มีลูกค้า / รอชำระ / ปิด
- Request free QR sticker (first time only)

### 5.6 Table Session Module
- Open session (static: auto on scan / dynamic: staff opens manually)
- Record guest count **(ผู้ใหญ่ + เด็ก สำหรับ Buffet)**
- **[Buffet] เลือก Package ตอนเปิดโต๊ะ**
- **[Buffet] บันทึก started_at, expires_at, last_order_at**
- Generate dynamic QR token (UUID, expires on bill close)
- **[Buffet] QR หมดอายุเมื่อ expires_at ถึง**
- Close session after payment
- Session history per table

### 5.7 Timer Module *(Buffet Mode only)*
- Countdown timer แสดงบนหน้าลูกค้า + POS
- Pusher push เมื่อถึง Last Order threshold → แจ้งเตือนลูกค้า + พนักงาน
- Pusher push เมื่อเหลือ 10 นาที → แจ้งเตือนอีกครั้ง
- Pusher push เมื่อหมดเวลา → ล็อกการสั่งอาหาร
- ต่อเวลา: staff กดต่อ → บวกเวลา + คิดเงินเพิ่ม

### 5.8 Order Module
- Customer places order via Mobile Order (no login required)
- Staff places order on behalf of customer (POS)
- **[Normal] คิดราคาต่อ item ปกติ**
- **[Buffet] Refill ฟรีถ้าเมนูอยู่ใน Package / Add-on คิดเงิน**
- **[Buffet] บันทึก round_number ของแต่ละรอบการสั่ง**
- **[Buffet] ล็อกไม่ให้สั่งหลัง last_order_at**
- Multiple order rounds per session
- Order statuses: `pending` → `confirmed` → `preparing` → `ready` → `served` → `cancelled`
- Add note per item
- Cancel individual items (with reason)
- Auto-calculate: subtotal, service charge, VAT, total

### 5.9 Kitchen Module
- Kitchen Display Screen (KDS) — shows all `confirmed` / `preparing` orders
- Update item status: กำลังรอ → กำลังทำ → เสร็จแล้ว
- Auto-print kitchen ticket on new order (if enabled)
- Alert when all items in order are ready → notify waiter
- **[Buffet] แสดง รอบที่ N และเวลาที่เหลือของโต๊ะ**

### 5.10 Payment Module
- **[Normal] Calculate bill: sum all order items**
- **[Buffet] Calculate bill: (ผู้ใหญ่ × ราคา) + (เด็ก × ราคา) + Add-on items + ต่อเวลา**
- Apply discount (baht or %)
- Payment methods: เงินสด, QR PromptPay, บัตรเครดิต
- PromptPay QR generation (GBPrimePay API)
- Slip upload + verification
- Print receipt (full / abbreviated)
- Close table + session on payment success

### 5.11 Expense Module *(Phase 1)*
- บันทึกค่าใช้จ่ายรายวัน (Expense log)
- หมวดหมู่ค่าใช้จ่าย: ค่าแรง, ค่าเช่า, ค่าน้ำ/ไฟ/แก๊ส, ค่า Packaging, ค่าซ่อม, อื่นๆ
- CRUD expense entries (วันที่, หมวดหมู่, จำนวนเงิน, หมายเหตุ)
- Monthly expense summary

### 5.12 Notification Module (Pusher)
- Push to POS channel on: new order, call staff, bill request
- Push to customer channel on: order status change
- **[Buffet] Push timer alerts: last order warning, 10-min warning, time expired**
- Notification log stored in DB (for history/replay)
- Mark as read

### 5.13 Dashboard & Reports Module
- Real-time: active tables, pending orders, today's revenue
- Sales by day / week / month / custom range
- Top-selling menus
- Revenue by category
- Hourly sales heatmap
- **P&L Report อย่างง่าย:**
  - Revenue (ยอดขาย)
  - COGS (ต้นทุนเมนู จาก cost × quantity)
  - Gross Profit = Revenue − COGS
  - Operating Expenses (จาก Expense Module)
  - Net Profit = Gross Profit − Expenses
- Export report as CSV / PDF

---

## 6. Database Schema

**Engine:** MySQL 8.0 | **Charset:** utf8mb4_unicode_ci

### ERD Overview
```
Restaurant ──< Users
           ──< MenuCategories ──< Menus ──< MenuOptions ──< MenuOptionChoices
           ──< Packages ──< PackageItems
                       └──< PackageAddons
           ──< Tables ──< TableSessions ──< Orders ──< OrderItems ──< OrderItemOptions
                                      └──── Payment
           ──< Expenses ──< ExpenseCategories
           ──< Notifications
```

---

### `restaurants`
```sql
CREATE TABLE restaurants (
  id            CHAR(36)      PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  slug          VARCHAR(100)  NOT NULL UNIQUE,
  logo          VARCHAR(500)  NULL,
  cover_image   VARCHAR(500)  NULL,
  address       TEXT          NULL,
  phone         VARCHAR(20)   NULL,
  tax_id        VARCHAR(20)   NULL,
  has_vat       TINYINT(1)    DEFAULT 0,
  vat_rate      DECIMAL(5,2)  DEFAULT 7.00,
  currency      VARCHAR(10)   DEFAULT 'THB',
  timezone      VARCHAR(50)   DEFAULT 'Asia/Bangkok',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### `restaurant_settings`
```sql
CREATE TABLE restaurant_settings (
  id                   CHAR(36)                    PRIMARY KEY,
  restaurant_id        CHAR(36)                    NOT NULL UNIQUE,
  mode                 ENUM('normal','buffet')      DEFAULT 'normal',   -- *** โหมดร้าน ***
  auto_confirm_order   TINYINT(1)                  DEFAULT 0,
  kitchen_print_auto   TINYINT(1)                  DEFAULT 1,
  slip_verify_enabled  TINYINT(1)                  DEFAULT 0,
  promptpay_number     VARCHAR(20)                 NULL,
  service_charge       DECIMAL(5,2)                DEFAULT 0.00,
  theme_color          VARCHAR(7)                  DEFAULT '#FF6B00',
  featured_menu_ids    JSON                        NULL,
  allow_call_staff     TINYINT(1)                  DEFAULT 1,
  call_staff_options   JSON                        NULL,
  allow_self_checkout  TINYINT(1)                  DEFAULT 1,
  updated_at           TIMESTAMP                   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `users`
```sql
CREATE TABLE users (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  name            VARCHAR(255)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  phone           VARCHAR(20)   NULL,
  password        VARCHAR(255)  NOT NULL,
  role            ENUM('owner','manager','cashier','waiter','kitchen') DEFAULT 'waiter',
  avatar          VARCHAR(500)  NULL,
  is_active       TINYINT(1)    DEFAULT 1,
  last_login_at   TIMESTAMP     NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `menu_categories`
```sql
CREATE TABLE menu_categories (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  name            VARCHAR(255)  NOT NULL,        -- ภาษาไทย
  name_en         VARCHAR(255)  NULL,            -- English
  image           VARCHAR(500)  NULL,
  sort_order      INT           DEFAULT 0,
  is_active       TINYINT(1)    DEFAULT 1,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `menus`
```sql
CREATE TABLE menus (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  category_id     CHAR(36)      NOT NULL,
  name            VARCHAR(255)  NOT NULL,        -- ภาษาไทย
  name_en         VARCHAR(255)  NULL,            -- English
  description     TEXT          NULL,
  image           VARCHAR(500)  NULL,
  price           DECIMAL(10,2) NOT NULL,
  cost            DECIMAL(10,2) NULL,            -- ต้นทุน สำหรับคำนวณกำไร
  calories        INT           NULL,
  is_available    TINYINT(1)    DEFAULT 1,
  is_featured     TINYINT(1)    DEFAULT 0,
  is_package_item TINYINT(1)    DEFAULT 0,       -- [Buffet] อยู่ใน Package
  is_addon        TINYINT(1)    DEFAULT 0,       -- [Buffet] เป็น Add-on คิดเงิน
  sort_order      INT           DEFAULT 0,
  tags            JSON          NULL,            -- e.g. ["เผ็ด","เจ","ยอดนิยม"]
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (category_id)   REFERENCES menu_categories(id)
);
```

---

### `menu_options`
```sql
CREATE TABLE menu_options (
  id           CHAR(36)      PRIMARY KEY,
  menu_id      CHAR(36)      NOT NULL,
  name         VARCHAR(255)  NOT NULL,   -- e.g. "ระดับความเผ็ด", "เพิ่มท็อปปิ้ง"
  is_required  TINYINT(1)    DEFAULT 0,
  max_select   INT           DEFAULT 1,
  sort_order   INT           DEFAULT 0,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);
```

---

### `menu_option_choices`
```sql
CREATE TABLE menu_option_choices (
  id           CHAR(36)      PRIMARY KEY,
  option_id    CHAR(36)      NOT NULL,
  name         VARCHAR(255)  NOT NULL,   -- e.g. "ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดมาก"
  price_addon  DECIMAL(10,2) DEFAULT 0.00,
  is_default   TINYINT(1)    DEFAULT 0,
  FOREIGN KEY (option_id) REFERENCES menu_options(id) ON DELETE CASCADE
);
```

---

### `packages` *(Buffet Mode)*
```sql
CREATE TABLE packages (
  id                    CHAR(36)       PRIMARY KEY,
  restaurant_id         CHAR(36)       NOT NULL,
  name                  VARCHAR(255)   NOT NULL,   -- e.g. "แพ็กเกจหมูพรีเมียม"
  description           TEXT           NULL,
  price_adult           DECIMAL(10,2)  NOT NULL,
  price_child           DECIMAL(10,2)  DEFAULT 0.00,
  price_child_min_age   INT            NULL,       -- เด็กอายุตั้งแต่ (ปี)
  price_child_max_age   INT            NULL,       -- ถึง (ปี)
  duration_minutes      INT            NOT NULL,   -- ระยะเวลา เช่น 90
  last_order_before     INT            DEFAULT 15, -- Last order ก่อนหมดกี่นาที
  extension_price       DECIMAL(10,2)  DEFAULT 0.00, -- ราคาต่อเวลา
  extension_minutes     INT            DEFAULT 30,   -- ต่อเวลาครั้งละกี่นาที
  is_active             TINYINT(1)     DEFAULT 1,
  sort_order            INT            DEFAULT 0,
  created_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `package_items` *(Buffet Mode)*
```sql
CREATE TABLE package_items (
  id          CHAR(36)   PRIMARY KEY,
  package_id  CHAR(36)   NOT NULL,
  menu_id     CHAR(36)   NOT NULL,               -- เมนูที่รวมอยู่ใน Package (Refill ฟรี)
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id)    REFERENCES menus(id)
);
```

---

### `package_addons` *(Buffet Mode)*
```sql
CREATE TABLE package_addons (
  id          CHAR(36)       PRIMARY KEY,
  package_id  CHAR(36)       NOT NULL,
  menu_id     CHAR(36)       NOT NULL,           -- เมนู Add-on คิดเงินพิเศษ
  price       DECIMAL(10,2)  NOT NULL,           -- ราคา Add-on (override เมนูปกติ)
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id)    REFERENCES menus(id)
);
```

---

### `tables`
```sql
CREATE TABLE tables (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  number          INT           NOT NULL,
  name            VARCHAR(100)  NOT NULL,   -- e.g. "โต๊ะ 1", "VIP 1"
  capacity        INT           DEFAULT 4,
  zone            VARCHAR(100)  NULL,       -- e.g. "ในร้าน", "นอกร้าน", "ชั้น 2"
  qr_type         ENUM('static','dynamic')  DEFAULT 'static',
  static_qr_code  VARCHAR(500)  NULL,       -- path to generated QR image
  status          ENUM('available','occupied','reserved','closed') DEFAULT 'available',
  is_active       TINYINT(1)    DEFAULT 1,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_table_number (restaurant_id, number),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `table_sessions`
```sql
CREATE TABLE table_sessions (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  table_id        CHAR(36)      NOT NULL,
  token           CHAR(36)      NOT NULL UNIQUE,   -- UUID for QR URL
  status          ENUM('active','closed','expired') DEFAULT 'active',
  guest_count     INT           DEFAULT 1,
  -- [Buffet fields]
  package_id      CHAR(36)      NULL,              -- Package ที่เลือก
  guest_adult     INT           DEFAULT 0,         -- จำนวนผู้ใหญ่
  guest_child     INT           DEFAULT 0,         -- จำนวนเด็ก
  started_at      TIMESTAMP     NULL,              -- เวลาเริ่มกิน (นาฬิกาเริ่มนับ)
  expires_at      TIMESTAMP     NULL,              -- เวลาหมด
  last_order_at   TIMESTAMP     NULL,              -- Deadline สั่งอาหารสุดท้าย
  is_extended     TINYINT(1)    DEFAULT 0,         -- ต่อเวลาแล้ว
  extension_count INT           DEFAULT 0,         -- ต่อเวลากี่ครั้ง
  -- [Common fields]
  opened_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  closed_at       TIMESTAMP     NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (table_id)      REFERENCES tables(id),
  FOREIGN KEY (package_id)    REFERENCES packages(id)
);
```

---

### `orders`
```sql
CREATE TABLE orders (
  id              CHAR(36)       PRIMARY KEY,
  restaurant_id   CHAR(36)       NOT NULL,
  session_id      CHAR(36)       NOT NULL,
  order_number    VARCHAR(20)    NOT NULL,    -- e.g. "ORD-0001"
  round_number    INT            DEFAULT 1,   -- [Buffet] รอบการสั่ง (1, 2, 3...)
  status          ENUM('pending','confirmed','preparing','ready','served','cancelled') DEFAULT 'pending',
  note            TEXT           NULL,
  subtotal        DECIMAL(10,2)  DEFAULT 0.00,
  discount        DECIMAL(10,2)  DEFAULT 0.00,
  service_charge  DECIMAL(10,2)  DEFAULT 0.00,
  vat_amount      DECIMAL(10,2)  DEFAULT 0.00,
  total           DECIMAL(10,2)  DEFAULT 0.00,
  served_by_id    CHAR(36)       NULL,
  confirmed_at    TIMESTAMP      NULL,
  preparing_at    TIMESTAMP      NULL,
  ready_at        TIMESTAMP      NULL,
  served_at       TIMESTAMP      NULL,
  cancelled_at    TIMESTAMP      NULL,
  cancel_reason   VARCHAR(255)   NULL,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (session_id)    REFERENCES table_sessions(id),
  FOREIGN KEY (served_by_id)  REFERENCES users(id)
);
```

---

### `order_items`
```sql
CREATE TABLE order_items (
  id              CHAR(36)       PRIMARY KEY,
  order_id        CHAR(36)       NOT NULL,
  menu_id         CHAR(36)       NOT NULL,
  name            VARCHAR(255)   NOT NULL,   -- snapshot at time of order
  price           DECIMAL(10,2)  NOT NULL,   -- snapshot
  cost            DECIMAL(10,2)  NULL,       -- snapshot ต้นทุน ณ เวลาสั่ง
  quantity        INT            DEFAULT 1,
  note            TEXT           NULL,
  is_refill       TINYINT(1)     DEFAULT 0,  -- [Buffet] true = Refill (ไม่คิดเงิน)
  is_addon        TINYINT(1)     DEFAULT 0,  -- [Buffet] true = Add-on (คิดเงินพิเศษ)
  subtotal        DECIMAL(10,2)  NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id)  REFERENCES menus(id)
);
```

---

### `order_item_options`
```sql
CREATE TABLE order_item_options (
  id              CHAR(36)       PRIMARY KEY,
  order_item_id   CHAR(36)       NOT NULL,
  choice_id       CHAR(36)       NOT NULL,
  name            VARCHAR(255)   NOT NULL,   -- snapshot
  price_addon     DECIMAL(10,2)  DEFAULT 0.00,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (choice_id)     REFERENCES menu_option_choices(id)
);
```

---

### `payments`
```sql
CREATE TABLE payments (
  id              CHAR(36)       PRIMARY KEY,
  restaurant_id   CHAR(36)       NOT NULL,
  session_id      CHAR(36)       NOT NULL UNIQUE,
  receipt_number  VARCHAR(20)    NOT NULL UNIQUE,   -- e.g. "REC-20240101-0001"
  method          ENUM('cash','qr_promptpay','credit_card','bank_transfer') DEFAULT 'cash',
  status          ENUM('unpaid','pending_verify','paid','refunded') DEFAULT 'unpaid',
  -- [Normal] ยอดรวม order items
  -- [Buffet] (ผู้ใหญ่ × ราคา) + (เด็ก × ราคา) + addon + extension
  subtotal        DECIMAL(10,2)  NOT NULL,
  package_charge  DECIMAL(10,2)  DEFAULT 0.00, -- [Buffet] ค่า Package
  addon_charge    DECIMAL(10,2)  DEFAULT 0.00, -- [Buffet] ค่า Add-on รวม
  extension_charge DECIMAL(10,2) DEFAULT 0.00, -- [Buffet] ค่าต่อเวลา
  discount        DECIMAL(10,2)  DEFAULT 0.00,
  service_charge  DECIMAL(10,2)  DEFAULT 0.00,
  vat_amount      DECIMAL(10,2)  DEFAULT 0.00,
  total           DECIMAL(10,2)  NOT NULL,
  amount_paid     DECIMAL(10,2)  NULL,
  change_amount   DECIMAL(10,2)  NULL,
  slip_url        VARCHAR(500)   NULL,
  slip_verified   TINYINT(1)     DEFAULT 0,
  verified_at     TIMESTAMP      NULL,
  paid_at         TIMESTAMP      NULL,
  note            TEXT           NULL,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (session_id)    REFERENCES table_sessions(id)
);
```

---

### `expense_categories`
```sql
CREATE TABLE expense_categories (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  name            VARCHAR(100)  NOT NULL,   -- ค่าแรง, ค่าเช่า, ค่าน้ำ/ไฟ/แก๊ส, ค่า Packaging, ค่าซ่อม, อื่นๆ
  icon            VARCHAR(50)   NULL,
  sort_order      INT           DEFAULT 0,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

### `expenses`
```sql
CREATE TABLE expenses (
  id              CHAR(36)       PRIMARY KEY,
  restaurant_id   CHAR(36)       NOT NULL,
  category_id     CHAR(36)       NOT NULL,
  amount          DECIMAL(10,2)  NOT NULL,
  note            TEXT           NULL,
  expense_date    DATE           NOT NULL,
  created_by_id   CHAR(36)       NULL,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (category_id)   REFERENCES expense_categories(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);
```

---

### `notifications`
```sql
CREATE TABLE notifications (
  id              CHAR(36)      PRIMARY KEY,
  restaurant_id   CHAR(36)      NOT NULL,
  type            VARCHAR(50)   NOT NULL,
  -- new_order / call_staff / bill_request / order_ready
  -- [Buffet] last_order_warning / timer_warning / timer_expired / time_extended
  title           VARCHAR(255)  NOT NULL,
  body            TEXT          NULL,
  data            JSON          NULL,       -- table_id, order_id, session_id, etc.
  is_read         TINYINT(1)    DEFAULT 0,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

## 7. API Routes

Base URL: `https://yourdomain.com/api/v1`

### Auth
```
POST   /auth/login              Login, returns token
POST   /auth/logout             Revoke token
GET    /auth/me                 Get current user
PUT    /auth/profile            Update profile
PUT    /auth/password           Change password
```

### Restaurant
```
GET    /restaurant              Get restaurant profile + settings
PUT    /restaurant              Update profile
PUT    /restaurant/settings     Update settings (including mode)
POST   /restaurant/logo         Upload logo
POST   /restaurant/cover        Upload cover image
```

### Menu
```
GET    /categories              List categories
POST   /categories              Create category
PUT    /categories/:id          Update category
DELETE /categories/:id          Delete category
PUT    /categories/reorder      Update sort order

GET    /menus                   List menus (with filters)
POST   /menus                   Create menu item
GET    /menus/:id               Get menu detail
PUT    /menus/:id               Update menu item
DELETE /menus/:id               Delete menu item
POST   /menus/:id/image         Upload menu image
PUT    /menus/:id/availability  Toggle available on/off

POST   /menus/:id/options       Add option group
PUT    /options/:id             Update option group
DELETE /options/:id             Delete option group
POST   /options/:id/choices     Add choice
PUT    /choices/:id             Update choice
DELETE /choices/:id             Delete choice
```

### Packages *(Buffet Mode)*
```
GET    /packages                List packages
POST   /packages                Create package
GET    /packages/:id            Get package detail
PUT    /packages/:id            Update package
DELETE /packages/:id            Delete package
POST   /packages/:id/items      Add menu items to package
DELETE /packages/:id/items/:menu_id   Remove menu item
POST   /packages/:id/addons     Add addon menu to package
PUT    /packages/:id/addons/:menu_id  Update addon price
DELETE /packages/:id/addons/:menu_id  Remove addon
```

### Tables
```
GET    /tables                  List all tables
POST   /tables                  Create table
PUT    /tables/:id              Update table
DELETE /tables/:id              Delete table
GET    /tables/:id/qr           Get QR code image
POST   /tables/:id/qr/generate  Re-generate static QR
GET    /tables/qr/export        Export all QR as PDF
```

### Sessions
```
POST   /sessions                Open session (staff)
                                  body: { table_id, guest_adult, guest_child, package_id? }
GET    /sessions/:token         Get session by QR token (customer)
PUT    /sessions/:id/start      Start timer [Buffet] (เริ่มนาฬิกา)
PUT    /sessions/:id/extend     Extend timer [Buffet] (ต่อเวลา)
PUT    /sessions/:id/close      Close session
GET    /sessions/:id/summary    Get session bill summary
GET    /sessions/:id/timer      Get timer status [Buffet]
```

### Orders
```
GET    /orders                  List orders (filters: status, table, date)
POST   /orders                  Place new order (customer or staff)
GET    /orders/:id              Get order detail
PUT    /orders/:id/status       Update order status (staff)
PUT    /orders/:id/cancel       Cancel order
GET    /sessions/:id/orders     Get all orders in a session
```

### Kitchen
```
GET    /kitchen/queue           Get active orders for kitchen display
PUT    /kitchen/items/:id       Update order item status
```

### Payments
```
GET    /payments/session/:id    Get payment for session
POST   /payments                Create payment record
PUT    /payments/:id/pay        Mark as paid (cash)
POST   /payments/:id/qr         Generate PromptPay QR
POST   /payments/:id/slip       Upload slip image
PUT    /payments/:id/verify     Verify slip (staff)
GET    /payments/:id/receipt    Get receipt data
```

### Expenses
```
GET    /expense-categories      List expense categories
POST   /expense-categories      Create category
PUT    /expense-categories/:id  Update category

GET    /expenses                List expenses (filter: date range, category)
POST   /expenses                Add expense entry
PUT    /expenses/:id            Update expense
DELETE /expenses/:id            Delete expense
GET    /expenses/summary        Monthly expense summary
```

### Notifications
```
GET    /notifications           List notifications (unread first)
PUT    /notifications/:id/read  Mark as read
PUT    /notifications/read-all  Mark all as read
```

### Dashboard
```
GET    /dashboard/summary       Today's summary (revenue, orders, active tables)
GET    /dashboard/sales         Sales report (query: range, group_by)
GET    /dashboard/top-menus     Top selling menus
GET    /dashboard/hourly        Hourly sales heatmap
GET    /dashboard/pl            P&L Report (revenue, COGS, gross profit, expenses, net profit)
GET    /dashboard/export        Export report CSV/PDF
```

### Public (Customer — no auth, session token only)
```
GET    /public/:token/restaurant   Get restaurant info + settings + mode
GET    /public/:token/menus        Get full menu for this session
GET    /public/:token/package      Get package info + remaining time [Buffet]
POST   /public/:token/orders       Place order
GET    /public/:token/orders       Get my orders in this session
POST   /public/:token/call-staff   Call staff with reason
POST   /public/:token/bill         Request bill
GET    /public/:token/bill         Get bill summary
POST   /public/:token/pay/qr       Pay via PromptPay QR
POST   /public/:token/pay/slip     Upload slip
```

---

## 8. Real-time Events (Pusher)

### Channel Naming
```
private-restaurant.{restaurant_id}       → POS / Staff
private-kitchen.{restaurant_id}          → Kitchen display
presence-table.{session_token}           → Customer session
```

### Events: Restaurant Channel (POS receives)
| Event                 | Payload                                        | Trigger                         |
|-----------------------|------------------------------------------------|---------------------------------|
| `new-order`           | order_id, table_name, items_count, total, round| Customer places order           |
| `call-staff`          | session_id, table_name, reason                 | Customer taps เรียกพนักงาน      |
| `bill-request`        | session_id, table_name, total                  | Customer taps เช็กบิล           |
| `payment-received`    | session_id, table_name, method, total          | Slip verified / QR paid         |
| `last-order-warning`  | session_id, table_name, minutes_left           | [Buffet] ถึงเวลา Last Order     |
| `timer-warning`       | session_id, table_name, minutes_left           | [Buffet] เหลือ 10 นาที          |
| `timer-expired`       | session_id, table_name                         | [Buffet] หมดเวลา                |
| `time-extended`       | session_id, table_name, new_expires_at         | [Buffet] ต่อเวลาแล้ว            |

### Events: Kitchen Channel (Kitchen display receives)
| Event               | Payload                                        | Trigger                        |
|---------------------|------------------------------------------------|--------------------------------|
| `new-order`         | order_id, table_name, items[], round_number    | Order confirmed                |
| `order-cancelled`   | order_id, table_name                           | Order cancelled                |
| `timer-warning`     | table_name, minutes_left                       | [Buffet] เตือนครัว             |

### Events: Table Channel (Customer receives)
| Event               | Payload                                        | Trigger                        |
|---------------------|------------------------------------------------|--------------------------------|
| `order-confirmed`   | order_id                                       | Staff confirms order           |
| `order-preparing`   | order_id                                       | Kitchen starts preparing       |
| `order-ready`       | order_id                                       | Kitchen marks ready            |
| `order-served`      | order_id                                       | Waiter marks served            |
| `last-order-warning`| minutes_left                                   | [Buffet] แจ้งเตือน Last Order  |
| `timer-warning`     | minutes_left                                   | [Buffet] เหลือ 10 นาที         |
| `timer-expired`     | –                                              | [Buffet] หมดเวลาแล้ว           |

---

## 9. QR Code Flow

### Static QR *(Normal Mode)*
```
Setup (one time):
  Staff → Generate QR → URL: /order/{restaurant_slug}/table/{table_id}
  Print sticker → Stick on table permanently

Customer visits:
  Scan QR → Open session automatically → Browse menu → Order → Pay
  Session closes → Same QR ready for next customer immediately
```

### Dynamic QR *(Normal Mode / Buffet Mode — บังคับ)*
```
Each visit:
  Customer arrives → Staff opens table on POS
  [Buffet] Staff เลือก Package + กรอกจำนวน ผู้ใหญ่ / เด็ก
  POS generates token (UUID) → Print QR slip
  URL: /order/session/{token}
  Hand QR to customer → Scan → Browse → Order → Pay
  Payment complete → Token expires → QR unusable
  Next customer → Staff generates new token
```

### Buffet Timer Flow
```
1. Staff เปิดโต๊ะ + เลือก Package + กรอกจำนวนคน
2. Staff กด "เริ่มเวลา" → started_at = NOW()
   → expires_at = started_at + duration_minutes
   → last_order_at = expires_at - last_order_before
3. Pusher ส่ง countdown ไปที่ลูกค้า + POS
4. เมื่อถึง last_order_at → Push "Last Order Warning"
5. เมื่อเหลือ 10 นาที → Push "Timer Warning"
6. เมื่อ expires_at → Push "Timer Expired" → ล็อกการสั่ง
7. Staff ชำระเงิน → ปิด session
```

---

## 10. Payment Flow

### Normal Mode

#### Cash
```
Customer → Request bill → Staff receives alert
→ Staff goes to table → Collects cash
→ Staff marks paid on POS → Receipt prints → Table closes
```

#### PromptPay QR
```
Customer → Request bill → Select QR payment
→ System generates PromptPay QR (GBPrimePay API)
→ Customer scans → Pays via banking app
→ GBPrimePay webhook → System marks paid
→ POS receives alert → Receipt prints → Table closes
```

#### Slip Upload
```
Customer → Request bill → Transfer manually
→ Upload slip image → Staff receives alert
→ Staff verifies slip → Marks paid → Table closes
```

### Buffet Mode
```
Bill = (จำนวนผู้ใหญ่ × ราคาผู้ใหญ่)
     + (จำนวนเด็ก × ราคาเด็ก)
     + ยอดรวม Add-on items ที่สั่ง
     + ค่าต่อเวลา (ถ้ามี)
     − ส่วนลด
     + Service charge
     + VAT

→ ชำระด้วยวิธีเดียวกับ Normal Mode
```

---

## 11. P&L Report (งบกำไรขาดทุนอย่างง่าย)

```
📊 P&L สำหรับเดือน [เดือน]

Revenue (ยอดขาย)
  ├── ยอดขายจาก order items                xxx,xxx บาท
  └── รวม Revenue                          xxx,xxx บาท

COGS (ต้นทุนขาย)
  ├── คำนวณจาก cost × quantity ใน order_items
  └── รวม COGS                             xxx,xxx บาท

Gross Profit = Revenue − COGS             xxx,xxx บาท
Gross Margin %                            xx.x%

Operating Expenses (ค่าใช้จ่ายดำเนินงาน)
  ├── ค่าแรง                              xxx,xxx บาท
  ├── ค่าเช่า                             xxx,xxx บาท
  ├── ค่าน้ำ/ไฟ/แก๊ส                     xxx,xxx บาท
  ├── ค่า Packaging                       xxx,xxx บาท
  ├── ค่าซ่อมบำรุง                        xxx,xxx บาท
  └── รวม Expenses                        xxx,xxx บาท

Net Profit = Gross Profit − Expenses      xxx,xxx บาท
Net Margin %                              xx.x%
```

---

## 12. Project Structure

```
mobile-order/
│
├── backend/                        # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── RestaurantController.php
│   │   │   │   ├── MenuCategoryController.php
│   │   │   │   ├── MenuController.php
│   │   │   │   ├── PackageController.php          # [Buffet] NEW
│   │   │   │   ├── TableController.php
│   │   │   │   ├── SessionController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── KitchenController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── ExpenseController.php          # [Expense] NEW
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   └── Public/
│   │   │   │       └── CustomerController.php
│   │   │   └── Middleware/
│   │   │       ├── RestaurantScope.php
│   │   │       └── RoleCheck.php
│   │   ├── Models/
│   │   │   ├── Restaurant.php
│   │   │   ├── RestaurantSetting.php
│   │   │   ├── User.php
│   │   │   ├── MenuCategory.php
│   │   │   ├── Menu.php
│   │   │   ├── MenuOption.php
│   │   │   ├── MenuOptionChoice.php
│   │   │   ├── Package.php                        # [Buffet] NEW
│   │   │   ├── PackageItem.php                    # [Buffet] NEW
│   │   │   ├── PackageAddon.php                   # [Buffet] NEW
│   │   │   ├── Table.php
│   │   │   ├── TableSession.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── OrderItemOption.php
│   │   │   ├── Payment.php
│   │   │   ├── ExpenseCategory.php                # [Expense] NEW
│   │   │   ├── Expense.php                        # [Expense] NEW
│   │   │   └── Notification.php
│   │   ├── Events/
│   │   │   ├── NewOrderEvent.php
│   │   │   ├── CallStaffEvent.php
│   │   │   ├── BillRequestEvent.php
│   │   │   ├── OrderStatusChangedEvent.php
│   │   │   ├── LastOrderWarningEvent.php          # [Buffet] NEW
│   │   │   ├── TimerWarningEvent.php              # [Buffet] NEW
│   │   │   └── TimerExpiredEvent.php              # [Buffet] NEW
│   │   └── Services/
│   │       ├── QrCodeService.php
│   │       ├── PaymentService.php
│   │       ├── OrderCalculatorService.php         # Normal + Buffet logic
│   │       ├── BuffetTimerService.php             # [Buffet] NEW
│   │       ├── ProfitLossService.php              # [P&L] NEW
│   │       └── ReportService.php
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       ├── api.php
│       └── public.php
│
├── frontend/                       # Turborepo Monorepo
│   ├── apps/
│   │   ├── customer/               # Next.js PWA (ลูกค้า)
│   │   │   └── app/
│   │   │       ├── [token]/
│   │   │       │   ├── page.tsx    # Menu browse
│   │   │       │   ├── cart/
│   │   │       │   ├── orders/
│   │   │       │   ├── timer/      # [Buffet] Countdown timer NEW
│   │   │       │   └── bill/
│   │   │       └── layout.tsx
│   │   ├── pos/                    # Next.js (พนักงาน + ครัว)
│   │   │   └── app/
│   │   │       ├── tables/         # Table grid (แสดง timer [Buffet])
│   │   │       ├── orders/
│   │   │       ├── kitchen/
│   │   │       ├── packages/       # [Buffet] Package management NEW
│   │   │       └── payments/
│   │   └── owner/                  # Next.js (เจ้าของร้าน)
│   │       └── app/
│   │           ├── dashboard/
│   │           ├── menus/
│   │           ├── packages/       # [Buffet] Package management NEW
│   │           ├── tables/
│   │           ├── expenses/       # [Expense] Expense log NEW
│   │           ├── reports/        # รวม P&L Report
│   │           └── settings/       # เลือก mode: normal/buffet
│   └── packages/
│       ├── ui/                     # Shared React components
│       └── types/                  # Shared TypeScript interfaces
│
└── SYSTEM_DESIGN.md               # ← This file
```

---

## 13. Environment Variables

### Backend (`backend/.env`)
```env
APP_NAME="Mobile Order"
APP_URL=https://yourdomain.com
APP_KEY=

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=mobile_order
DB_USERNAME=db_user
DB_PASSWORD=db_password

# Pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap1

# Payment
GBPRIMEPAY_TOKEN=
GBPRIMEPAY_SECRET=
GBPRIMEPAY_SANDBOX=true

# File Storage
FILESYSTEM_DISK=public
MAX_UPLOAD_SIZE_MB=5
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

---

## 14. Deployment Guide (HostAtom)

> **Environment ที่ตรวจสอบแล้ว** (จาก Dashboard)
> - PHP **8.4.21** ✅ (Laravel 11 ต้องการ 8.2+)
> - **Scheduled Tasks** ✅ (ใช้สำหรับ Buffet Timer Cron)
> - **Git Deploy** ✅ (push code ได้โดยตรง)
> - **PHP Composer** ✅ (ติดตั้ง dependencies บน server)
> - **Node.js** ✅ (build Next.js บน server)
> - **Apache & nginx** ✅ (.htaccess ใช้ได้)
> - **Web Application Firewall** ✅

---

### ขั้นตอนที่ 0 — ตั้งค่า Subdomain (ทำครั้งเดียว)

ไปที่ **Hosting & DNS → DNS** แล้วสร้าง Subdomain ดังนี้:

```
api.yourdomain.com    → public_html/api/public     (Laravel backend)
order.yourdomain.com  → public_html/order/          (Customer PWA)
pos.yourdomain.com    → public_html/pos/            (POS + Kitchen)
admin.yourdomain.com  → public_html/admin/          (Owner dashboard)
```

> SSL Wildcard ครอบคลุม subdomain ทุกตัวอัตโนมัติ — ไม่ต้องตั้งเพิ่ม

---

### ขั้นตอนที่ 1 — สร้าง MySQL Database

ไปที่ **Dashboard → Databases**

```
1. สร้าง Database ชื่อ: mobile_order
2. สร้าง Database User + กำหนด Password
3. Add User to Database (เลือก All Privileges)
4. จด Host, DB name, Username, Password ใส่ .env
```

---

### ขั้นตอนที่ 2 — Deploy Backend (Laravel) ด้วย Git

ไปที่ **Get Started → Deploy using Git**

```bash
# 1. เพิ่ม Remote ชี้ไปที่ HostAtom Git
git remote add hostatom ssh://thereal@147.50.255.13/home/thereal/repos/mobile-order-backend.git

# 2. Push ครั้งแรก
git push hostatom main
```

**หลัง Push — SSH เข้าไปรันคำสั่ง (หรือใช้ Terminal ใน File Manager):**

```bash
cd ~/httpdocs/api

# ติดตั้ง dependencies ผ่าน PHP Composer บน server
# Dashboard → Dev Tools → PHP Composer
composer install --no-dev --optimize-autoloader

# Copy และแก้ไข .env
cp .env.example .env
php artisan key:generate

# ตั้งค่า .env (DB, Pusher, GBPrimePay)
nano .env

# รัน Migration
php artisan migrate --seed

# ตั้งค่า Permissions
chmod -R 775 storage bootstrap/cache

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Storage symlink
php artisan storage:link
```

**ตั้งค่า Document Root** ของ `api.yourdomain.com` ให้ชี้ไปที่:
```
/home/thereal/httpdocs/api/public
```

---

### ขั้นตอนที่ 3 — Deploy Frontend (Next.js) ด้วย Node.js บน Server

ไปที่ **Get Started → Node.js**

```bash
# 1. Upload source frontend/ ขึ้น server ก่อน (FTP หรือ Git)
cd ~/httpdocs/frontend

# 2. ติดตั้ง dependencies
npm install

# 3. Build static export (ทำทีเดียวทั้ง 3 apps)
npm run build   # Turborepo build ทุก app พร้อมกัน

# 4. Copy output ไปยัง subdomain folders
cp -r apps/customer/out/* ~/httpdocs/order/
cp -r apps/pos/out/*      ~/httpdocs/pos/
cp -r apps/owner/out/*    ~/httpdocs/admin/
```

> **หมายเหตุ:** ทุกครั้งที่อัปเดต frontend ให้รัน build + copy ใหม่เท่านั้น  
> ไม่ต้องรีสตาร์ท server เพราะเป็น static files

---

### ขั้นตอนที่ 4 — ตั้งค่า .htaccess (SPA Routing)

สร้างไฟล์ `.htaccess` ใน **แต่ละ folder** (`order/`, `pos/`, `admin/`):

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

สร้างไฟล์ `.htaccess` ใน `api/public/` (Laravel ส่วนใหญ่มีให้แล้ว):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

### ขั้นตอนที่ 5 — ตั้งค่า Scheduled Tasks (Cron Jobs)

ไปที่ **Dashboard → Dev Tools → Scheduled Tasks**

เพิ่ม Cron Job ต่อไปนี้:

```bash
# Laravel Scheduler (ทุก 1 นาที) — บังคับต้องมี
* * * * * php /home/thereal/httpdocs/api/artisan schedule:run >> /dev/null 2>&1
```

จากนั้นใน `app/Console/Kernel.php` (หรือ `routes/console.php` ใน Laravel 11) ลงทะเบียน:

```php
// ตรวจ Buffet Timer ทุก 1 นาที
Schedule::command('buffet:check-timers')->everyMinute();

// ทำความสะอาด expired sessions ทุกคืน
Schedule::command('sessions:cleanup')->dailyAt('02:00');

// สร้าง P&L snapshot รายเดือน
Schedule::command('reports:monthly-snapshot')->monthlyOn(1, '00:00');
```

**Artisan Commands ที่ต้องสร้าง:**

```
app/Console/Commands/
├── CheckBuffetTimers.php     → ตรวจ expires_at / last_order_at → Push Pusher event
├── CleanupExpiredSessions.php → ปิด session ที่ expired แต่ยังไม่ถูกปิด
└── GenerateMonthlySnapshot.php → สรุป P&L รายเดือนเก็บ cache
```

---

### ขั้นตอนที่ 6 — ตรวจสอบการ Deploy

```bash
# ทดสอบ API
curl https://api.yourdomain.com/api/v1/health

# ตรวจสอบ Laravel log
tail -f ~/httpdocs/api/storage/logs/laravel.log

# ตรวจสอบ Cron ทำงาน
# Dashboard → Dev Tools → Scheduled Tasks → ดู Last Run
```

**Checklist หลัง Deploy:**

```
□ api.yourdomain.com/api/v1/health  → 200 OK
□ order.yourdomain.com              → Customer PWA โหลดได้
□ pos.yourdomain.com                → POS โหลดได้
□ admin.yourdomain.com              → Owner dashboard โหลดได้
□ https:// ทุก subdomain            → SSL ใช้งานได้
□ Pusher connection                 → ทดสอบ real-time event
□ Scheduled Tasks                  → Last Run แสดงเวลาล่าสุด
□ File upload                      → อัปโหลดรูปเมนูได้
□ PromptPay QR                     → GBPrimePay sandbox ทำงาน
```

---

### การ Update โค้ดหลัง Deploy (Workflow ปกติ)

```bash
# Backend — push แล้วรันบน server
git push hostatom main
# SSH แล้วรัน:
composer install --no-dev --optimize-autoloader
php artisan migrate
php artisan config:cache && php artisan route:cache

# Frontend — build แล้ว copy
npm run build
cp -r apps/customer/out/* ~/httpdocs/order/
cp -r apps/pos/out/*      ~/httpdocs/pos/
cp -r apps/owner/out/*    ~/httpdocs/admin/
```

---

## Appendix — Feature Matrix

| Feature                    | Normal Mode | Buffet Mode |
|----------------------------|:-----------:|:-----------:|
| สั่งอาหาร a la carte        | ✅           | ✅ (Add-on)  |
| Static QR                  | ✅           | ❌           |
| Dynamic QR                 | ✅           | ✅ (บังคับ)  |
| Package / ราคาต่อคน        | ❌           | ✅           |
| Refill ฟรี                 | ❌           | ✅           |
| Countdown Timer            | ❌           | ✅           |
| Last Order Alert           | ❌           | ✅           |
| ต่อเวลา                     | ❌           | ✅           |
| บันทึกค่าใช้จ่าย            | ✅           | ✅           |
| P&L Report                 | ✅           | ✅           |
| PromptPay QR Payment       | ✅           | ✅           |
| Slip Upload                | ✅           | ✅           |
| Kitchen Display (KDS)      | ✅           | ✅           |
| Pusher Real-time           | ✅           | ✅           |

---

*Last updated: May 2026*
