// POS Mock Data
// Tables, sessions, orders. Will be replaced by API in Part 4.

export type TableStatus = "available" | "occupied" | "billing" | "closed";

export type Table = {
  id: string;
  number: number;
  name: string;
  capacity: number;
  zone: string;
  qrType: "static" | "dynamic";
  status: TableStatus;
};

export type OrderItemStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type OrderItemOption = {
  name: string;
  priceAddon: number;
};

export type OrderItem = {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  options: OrderItemOption[];
  status: OrderItemStatus;
  orderedBy: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  roundNumber: number;
  tableId: string;
  tableName: string;
  sessionId: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";
  items: OrderItem[];
  total: number;
  placedAt: number;
};

export type Session = {
  id: string;
  tableId: string;
  tableName: string;
  guestCount: number;
  openedAt: number;
  staff: string;
  totalAmount: number;
  itemsCount: number;
  hasCallStaff?: { reason: string; at: number };
  hasBillRequest?: boolean;
};

export type Notification = {
  id: string;
  type: "new-order" | "call-staff" | "bill-request" | "payment-received";
  title: string;
  body: string;
  tableName: string;
  at: number;
  isRead: boolean;
  meta?: Record<string, string>;
};

export const STAFF_NAME = "พนักงาน Nawawat";
export const RESTAURANT_NAME = "ครัวเพลิน";

// --- Zones / Tables (20 tables) ---
const ZONES = [
  { id: "indoor", name: "ในร้าน", capacity: 8 },
  { id: "outdoor", name: "นอกร้าน", capacity: 6 },
  { id: "second", name: "ชั้น 2", capacity: 5 },
  { id: "vip", name: "VIP", capacity: 1 },
];

let n = 1;
function makeTable(
  zone: string,
  letter: string,
  capacity: number,
  qrType: "static" | "dynamic" = "static",
): Table {
  const num = n++;
  return {
    id: `t_${letter.toLowerCase()}${num}`,
    number: num,
    name: `${letter}${num}`,
    capacity,
    zone,
    qrType,
    status: "available",
  };
}

export const tables: Table[] = [
  // Indoor 8
  ...Array.from({ length: 8 }, (_, i) => makeTable("ในร้าน", "A", 4)),
  // Outdoor 6
  ...Array.from({ length: 6 }, (_, i) => makeTable("นอกร้าน", "B", 4)),
  // Second floor 5
  ...Array.from({ length: 5 }, (_, i) => makeTable("ชั้น 2", "C", 6)),
  // VIP
  makeTable("VIP", "V", 10, "dynamic"),
];
// Reset table numbers properly
tables.forEach((t, idx) => {
  const zoneTables = tables.filter((x) => x.zone === t.zone);
  const localIdx = zoneTables.indexOf(t) + 1;
  t.name = `${t.name[0]}${localIdx}`;
  t.number = idx + 1;
});

// Seed initial state — some tables already occupied with sample orders
const now = Date.now();

function setStatus(name: string, status: TableStatus) {
  const t = tables.find((x) => x.name === name);
  if (t) t.status = status;
}

setStatus("A2", "occupied");
setStatus("A6", "occupied");
setStatus("A7", "billing");
setStatus("B3", "occupied");
setStatus("C2", "occupied");
setStatus("V1", "occupied");

export const sessions: Session[] = [
  {
    id: "s_1",
    tableId: tables.find((t) => t.name === "A2")!.id,
    tableName: "A2",
    guestCount: 2,
    openedAt: now - 18 * 60 * 1000,
    staff: "พนักงาน Nawawat",
    totalAmount: 340,
    itemsCount: 3,
  },
  {
    id: "s_2",
    tableId: tables.find((t) => t.name === "A6")!.id,
    tableName: "A6",
    guestCount: 4,
    openedAt: now - 32 * 60 * 1000,
    staff: "พนักงาน Mai",
    totalAmount: 685,
    itemsCount: 6,
    hasCallStaff: { reason: "ขอเครื่องปรุง", at: now - 90 * 1000 },
  },
  {
    id: "s_3",
    tableId: tables.find((t) => t.name === "A7")!.id,
    tableName: "A7",
    guestCount: 3,
    openedAt: now - 65 * 60 * 1000,
    staff: "พนักงาน Nawawat",
    totalAmount: 920,
    itemsCount: 8,
    hasBillRequest: true,
  },
  {
    id: "s_4",
    tableId: tables.find((t) => t.name === "B3")!.id,
    tableName: "B3",
    guestCount: 2,
    openedAt: now - 8 * 60 * 1000,
    staff: "พนักงาน Mai",
    totalAmount: 240,
    itemsCount: 2,
  },
  {
    id: "s_5",
    tableId: tables.find((t) => t.name === "C2")!.id,
    tableName: "C2",
    guestCount: 5,
    openedAt: now - 42 * 60 * 1000,
    staff: "พนักงาน Nawawat",
    totalAmount: 540,
    itemsCount: 5,
  },
  {
    id: "s_6",
    tableId: tables.find((t) => t.name === "V1")!.id,
    tableName: "V1",
    guestCount: 6,
    openedAt: now - 50 * 60 * 1000,
    staff: "พนักงาน Mai",
    totalAmount: 1450,
    itemsCount: 12,
  },
];

export const orders: Order[] = [
  // A6 — 2 rounds, mixed statuses
  {
    id: "o_1",
    orderNumber: "ORD-0001",
    roundNumber: 1,
    tableId: tables.find((t) => t.name === "A6")!.id,
    tableName: "A6",
    sessionId: "s_2",
    status: "served",
    placedAt: now - 30 * 60 * 1000,
    total: 365,
    items: [
      {
        id: "oi_1",
        menuId: "m_pad_kra_pao",
        name: "ผัดกะเพราหมูสับไข่ดาว",
        price: 89,
        quantity: 2,
        options: [{ name: "เผ็ดน้อย", priceAddon: 0 }, { name: "ไข่ดาว", priceAddon: 15 }],
        status: "served",
        orderedBy: "ลูกค้า A",
      },
      {
        id: "oi_2",
        menuId: "m_pad_thai",
        name: "ผัดไทยกุ้งสด",
        price: 129,
        quantity: 1,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า B",
      },
      {
        id: "oi_3",
        menuId: "m_thai_tea",
        name: "ชาเย็นรสไทย",
        price: 45,
        quantity: 2,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า A",
      },
    ],
  },
  {
    id: "o_2",
    orderNumber: "ORD-0002",
    roundNumber: 2,
    tableId: tables.find((t) => t.name === "A6")!.id,
    tableName: "A6",
    sessionId: "s_2",
    status: "preparing",
    placedAt: now - 7 * 60 * 1000,
    total: 318,
    items: [
      {
        id: "oi_4",
        menuId: "m_tom_yum",
        name: "ต้มยำกุ้งน้ำข้น",
        price: 189,
        quantity: 1,
        options: [{ name: "เผ็ดมาก", priceAddon: 0 }],
        status: "preparing",
        orderedBy: "พนักงาน Nawawat",
      },
      {
        id: "oi_5",
        menuId: "m_pad_see_ew",
        name: "ผัดซีอิ๊วหมู",
        price: 89,
        quantity: 1,
        options: [],
        status: "ready",
        orderedBy: "ลูกค้า B",
      },
      {
        id: "oi_6",
        menuId: "m_lime_soda",
        name: "โซดามะนาว",
        price: 35,
        quantity: 1,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า A",
        note: "หวานน้อย ไม่ใส่น้ำแข็ง",
      },
    ],
  },
  // A2 — recent order
  {
    id: "o_3",
    orderNumber: "ORD-0003",
    roundNumber: 1,
    tableId: tables.find((t) => t.name === "A2")!.id,
    tableName: "A2",
    sessionId: "s_1",
    status: "confirmed",
    placedAt: now - 3 * 60 * 1000,
    total: 340,
    items: [
      {
        id: "oi_7",
        menuId: "m_khao_man_kai",
        name: "ข้าวมันไก่ต้ม",
        price: 75,
        quantity: 2,
        options: [],
        status: "preparing",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_8",
        menuId: "m_gaeng_keaw",
        name: "แกงเขียวหวานไก่",
        price: 99,
        quantity: 1,
        options: [],
        status: "confirmed",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_9",
        menuId: "m_water",
        name: "น้ำเปล่า",
        price: 15,
        quantity: 2,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
    ],
  },
  // B3 — just placed
  {
    id: "o_4",
    orderNumber: "ORD-0004",
    roundNumber: 1,
    tableId: tables.find((t) => t.name === "B3")!.id,
    tableName: "B3",
    sessionId: "s_4",
    status: "pending",
    placedAt: now - 30 * 1000,
    total: 240,
    items: [
      {
        id: "oi_10",
        menuId: "m_som_tum",
        name: "ส้มตำไทยกุ้งสด",
        price: 89,
        quantity: 1,
        options: [{ name: "เผ็ดกลาง", priceAddon: 0 }],
        status: "pending",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_11",
        menuId: "m_larb",
        name: "ลาบหมูสับอีสาน",
        price: 95,
        quantity: 1,
        options: [],
        status: "pending",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_12",
        menuId: "m_water",
        name: "น้ำเปล่า",
        price: 15,
        quantity: 1,
        options: [],
        status: "pending",
        orderedBy: "ลูกค้า",
      },
    ],
  },
  // C2 — older
  {
    id: "o_5",
    orderNumber: "ORD-0005",
    roundNumber: 1,
    tableId: tables.find((t) => t.name === "C2")!.id,
    tableName: "C2",
    sessionId: "s_5",
    status: "served",
    placedAt: now - 38 * 60 * 1000,
    total: 540,
    items: [
      {
        id: "oi_13",
        menuId: "m_pad_thai",
        name: "ผัดไทยกุ้งสด",
        price: 129,
        quantity: 3,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_14",
        menuId: "m_yen_ta_fo",
        name: "เย็นตาโฟทรงเครื่อง",
        price: 85,
        quantity: 1,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_15",
        menuId: "m_thai_tea",
        name: "ชาเย็นรสไทย",
        price: 45,
        quantity: 2,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
    ],
  },
  // V1 — multiple rounds
  {
    id: "o_6",
    orderNumber: "ORD-0006",
    roundNumber: 1,
    tableId: tables.find((t) => t.name === "V1")!.id,
    tableName: "V1",
    sessionId: "s_6",
    status: "served",
    placedAt: now - 45 * 60 * 1000,
    total: 720,
    items: [
      {
        id: "oi_16",
        menuId: "m_khao_kha_moo",
        name: "ข้าวขาหมูตุ๋นเปื่อย",
        price: 95,
        quantity: 4,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_17",
        menuId: "m_tom_yum",
        name: "ต้มยำกุ้งน้ำข้น",
        price: 189,
        quantity: 1,
        options: [],
        status: "served",
        orderedBy: "ลูกค้า",
      },
    ],
  },
  {
    id: "o_7",
    orderNumber: "ORD-0007",
    roundNumber: 2,
    tableId: tables.find((t) => t.name === "V1")!.id,
    tableName: "V1",
    sessionId: "s_6",
    status: "preparing",
    placedAt: now - 4 * 60 * 1000,
    total: 730,
    items: [
      {
        id: "oi_18",
        menuId: "m_pad_pak",
        name: "ผัดผักรวมน้ำมันหอย",
        price: 75,
        quantity: 2,
        options: [],
        status: "preparing",
        orderedBy: "พนักงาน Mai",
      },
      {
        id: "oi_19",
        menuId: "m_mango_sticky",
        name: "ข้าวเหนียวมะม่วงน้ำดอกไม้",
        price: 79,
        quantity: 4,
        options: [],
        status: "ready",
        orderedBy: "ลูกค้า",
      },
      {
        id: "oi_20",
        menuId: "m_thai_tea",
        name: "ชาเย็นรสไทย",
        price: 45,
        quantity: 6,
        options: [],
        status: "preparing",
        orderedBy: "ลูกค้า",
        note: "หวานน้อย",
      },
    ],
  },
];

export const initialNotifications: Notification[] = [
  {
    id: "n_1",
    type: "call-staff",
    title: "เรียกพนักงาน",
    body: "ขอเครื่องปรุง",
    tableName: "A6",
    at: now - 90 * 1000,
    isRead: false,
  },
  {
    id: "n_2",
    type: "bill-request",
    title: "ขอเช็คบิล",
    body: "₿920",
    tableName: "A7",
    at: now - 2 * 60 * 1000,
    isRead: false,
  },
  {
    id: "n_3",
    type: "new-order",
    title: "ออเดอร์ใหม่",
    body: "3 รายการ · ₿240",
    tableName: "B3",
    at: now - 30 * 1000,
    isRead: false,
  },
  {
    id: "n_4",
    type: "new-order",
    title: "ออเดอร์ใหม่ (รอบ 2)",
    body: "3 รายการ · ₿730",
    tableName: "V1",
    at: now - 4 * 60 * 1000,
    isRead: true,
  },
];

export const POSSIBLE_NOTIFICATIONS: Array<
  Omit<Notification, "id" | "at" | "isRead">
> = [
  { type: "new-order", title: "ออเดอร์ใหม่", body: "2 รายการ · ₿178", tableName: "A4" },
  { type: "call-staff", title: "เรียกพนักงาน", body: "เติมน้ำเปล่า", tableName: "A3" },
  { type: "call-staff", title: "เรียกพนักงาน", body: "ขอช้อนเพิ่ม", tableName: "C1" },
  { type: "bill-request", title: "ขอเช็คบิล", body: "₿540", tableName: "C2" },
  { type: "new-order", title: "ออเดอร์ใหม่", body: "5 รายการ · ₿620", tableName: "B5" },
  { type: "payment-received", title: "ชำระเงินเรียบร้อย", body: "QR ₿920", tableName: "A7" },
];
