// Owner app mock data — restaurant info, menus, expenses, sales aggregates.
// Will be replaced by API in Part 4.

export type Restaurant = {
  name: string;
  nameEn: string;
  slug: string;
  tagline: string;
  phone: string;
  address: string;
  taxId: string;
  serviceCharge: number;
  vatRate: number;
  hasVat: boolean;
  promptpayNumber: string;
  themeColor: string;
  mode: "normal" | "buffet";
  allowCallStaff: boolean;
  allowSelfCheckout: boolean;
  autoConfirmOrder: boolean;
  kitchenPrintAuto: boolean;
  slipVerifyEnabled: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  cost: number;
  calories?: number;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  // sales aggregate this month
  soldCount: number;
};

export type Table = {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  qrType: "static" | "dynamic";
  isActive: boolean;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
};

// --- Buffet Package types ---
export type Package = {
  id: string;
  name: string;
  description: string;
  priceAdult: number;
  priceChild: number;
  childAgeMin?: number;
  childAgeMax?: number;
  durationMinutes: number;
  lastOrderBefore: number;
  extensionPrice: number;
  extensionMinutes: number;
  isActive: boolean;
  // menu ids included for free (refillable)
  packageMenuIds: string[];
  // addon: { menuId, addonPrice }
  addons: { menuId: string; price: number }[];
  // sales aggregate this month
  ordersThisMonth: number;
  revenueThisMonth: number;
};

export type Expense = {
  id: string;
  categoryId: string;
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD
  createdBy: string;
};

// --- Restaurant ---
export const restaurant: Restaurant = {
  name: "ครัวเพลิน",
  nameEn: "Plearn Kitchen",
  slug: "plearn-kitchen",
  tagline: "อาหารไทยรสมือแม่ ทำใหม่ทุกจาน",
  phone: "02-123-4567",
  address: "88/1 ซ.ทองหล่อ 10 ถ.สุขุมวิท คลองตัน วัฒนา กรุงเทพ 10110",
  taxId: "0105561234567",
  serviceCharge: 10,
  vatRate: 7,
  hasVat: true,
  promptpayNumber: "0812345678",
  themeColor: "#3B82F6",
  mode: "normal",
  allowCallStaff: true,
  allowSelfCheckout: true,
  autoConfirmOrder: false,
  kitchenPrintAuto: true,
  slipVerifyEnabled: true,
};

// --- Categories (icon = semantic key resolved via Icons.tsx) ---
export const categories: MenuCategory[] = [
  { id: "rice", name: "ข้าวกับข้าว", nameEn: "Rice Dishes", icon: "rice", isActive: true, sortOrder: 1, itemCount: 3 },
  { id: "noodle", name: "เส้น", nameEn: "Noodles", icon: "noodle", isActive: true, sortOrder: 2, itemCount: 3 },
  { id: "stir-fry", name: "ผัด ๆ", nameEn: "Stir Fried", icon: "stir-fry", isActive: true, sortOrder: 3, itemCount: 2 },
  { id: "soup", name: "ต้ม / แกง", nameEn: "Soup & Curry", icon: "soup", isActive: true, sortOrder: 4, itemCount: 2 },
  { id: "salad", name: "ยำ / สลัด", nameEn: "Salad", icon: "salad", isActive: true, sortOrder: 5, itemCount: 2 },
  { id: "drink", name: "เครื่องดื่ม", nameEn: "Drinks", icon: "drink", isActive: true, sortOrder: 6, itemCount: 3 },
  { id: "dessert", name: "ของหวาน", nameEn: "Dessert", icon: "dessert", isActive: true, sortOrder: 7, itemCount: 2 },
];

// --- Menus (17 items, with cost & sold count for P&L) ---
export const menus: MenuItem[] = [
  { id: "m_pad_kra_pao", categoryId: "rice", name: "ผัดกะเพราหมูสับไข่ดาว", nameEn: "Pad Kra Pao", description: "หมูสับผัดใบกะเพรา รสจัดจ้าน", price: 89, cost: 32, calories: 620, tags: ["ขายดี", "เผ็ด"], isAvailable: true, isFeatured: true, soldCount: 248 },
  { id: "m_khao_man_kai", categoryId: "rice", name: "ข้าวมันไก่ต้ม", nameEn: "Chicken Rice", description: "ไก่ต้มเนื้อนุ่ม ข้าวหุงน้ำมันไก่หอม", price: 75, cost: 28, calories: 540, tags: ["แนะนำ"], isAvailable: true, isFeatured: true, soldCount: 186 },
  { id: "m_khao_kha_moo", categoryId: "rice", name: "ข้าวขาหมูตุ๋นเปื่อย", nameEn: "Stewed Pork", description: "ขาหมูตุ๋นเครื่องยาจีน เคี่ยวนาน 6 ชม", price: 95, cost: 38, calories: 720, tags: ["ขายดี"], isAvailable: true, isFeatured: false, soldCount: 142 },
  { id: "m_pad_thai", categoryId: "noodle", name: "ผัดไทยกุ้งสด", nameEn: "Pad Thai", description: "เส้นจันท์ผัดสูตรเฉพาะ กุ้งสดตัวโต", price: 129, cost: 52, calories: 580, tags: ["แนะนำ", "ยอดนิยม"], isAvailable: true, isFeatured: true, soldCount: 312 },
  { id: "m_ba_mee", categoryId: "noodle", name: "บะหมี่หมูแดงเกี๊ยว", nameEn: "Egg Noodle BBQ Pork", description: "เส้นบะหมี่ไข่เหนียวนุ่ม", price: 79, cost: 30, calories: 510, tags: [], isAvailable: true, isFeatured: false, soldCount: 98 },
  { id: "m_yen_ta_fo", categoryId: "noodle", name: "เย็นตาโฟทรงเครื่อง", nameEn: "Yen Ta Fo", description: "เส้นเหนียวนุ่ม น้ำซุปสีชมพู", price: 85, cost: 34, calories: 480, tags: [], isAvailable: true, isFeatured: false, soldCount: 76 },
  { id: "m_pad_see_ew", categoryId: "stir-fry", name: "ผัดซีอิ๊วหมู", nameEn: "Pad See Ew", description: "เส้นใหญ่ผัดซอสดำกลมกล่อม", price: 89, cost: 32, tags: [], isAvailable: true, isFeatured: false, soldCount: 88 },
  { id: "m_pad_pak", categoryId: "stir-fry", name: "ผัดผักรวมน้ำมันหอย", nameEn: "Stir-Fried Veg", description: "ผักสดตามฤดูกาล", price: 75, cost: 22, calories: 220, tags: ["เจ", "เฮลตี้"], isAvailable: true, isFeatured: false, soldCount: 64 },
  { id: "m_tom_yum", categoryId: "soup", name: "ต้มยำกุ้งน้ำข้น", nameEn: "Tom Yum Goong", description: "ต้มยำสูตรน้ำข้น กุ้งแม่น้ำตัวโต", price: 189, cost: 78, calories: 350, tags: ["เผ็ด", "ซิกเนเจอร์"], isAvailable: true, isFeatured: true, soldCount: 220 },
  { id: "m_gaeng_keaw", categoryId: "soup", name: "แกงเขียวหวานไก่", nameEn: "Green Curry", description: "พริกแกงตำมือ กะทิคั้นสด", price: 99, cost: 40, tags: ["เผ็ด"], isAvailable: true, isFeatured: false, soldCount: 110 },
  { id: "m_som_tum", categoryId: "salad", name: "ส้มตำไทยกุ้งสด", nameEn: "Som Tum Goong", description: "ส้มตำสูตรอีสาน ตำสด ๆ", price: 89, cost: 30, tags: ["เผ็ด"], isAvailable: true, isFeatured: false, soldCount: 168 },
  { id: "m_larb", categoryId: "salad", name: "ลาบหมูสับอีสาน", nameEn: "Larb Moo", description: "ลาบหมูสับสูตรอีสานแท้", price: 95, cost: 36, tags: ["เผ็ด"], isAvailable: true, isFeatured: false, soldCount: 84 },
  { id: "m_thai_tea", categoryId: "drink", name: "ชาเย็นรสไทย", nameEn: "Thai Iced Tea", description: "ชาเย็นสูตรเข้มข้น", price: 45, cost: 12, tags: ["เย็น"], isAvailable: true, isFeatured: false, soldCount: 384 },
  { id: "m_lime_soda", categoryId: "drink", name: "โซดามะนาว", nameEn: "Lime Soda", description: "โซดาเย็น บีบมะนาวสด", price: 35, cost: 8, tags: ["เย็น"], isAvailable: true, isFeatured: false, soldCount: 152 },
  { id: "m_water", categoryId: "drink", name: "น้ำเปล่า", nameEn: "Water", description: "น้ำดื่มขวด 500ml", price: 15, cost: 5, tags: [], isAvailable: true, isFeatured: false, soldCount: 412 },
  { id: "m_mango_sticky", categoryId: "dessert", name: "ข้าวเหนียวมะม่วงน้ำดอกไม้", nameEn: "Mango Sticky Rice", description: "ข้าวเหนียวมูนกะทิ", price: 79, cost: 28, tags: ["ตามฤดูกาล"], isAvailable: true, isFeatured: true, soldCount: 96 },
  { id: "m_bua_loy", categoryId: "dessert", name: "บัวลอยไข่หวานกะทิสด", nameEn: "Bua Loy", description: "บัวลอยเหนียวนุ่ม ใส่ไข่หวาน", price: 55, cost: 18, tags: [], isAvailable: false, isFeatured: false, soldCount: 42 },
];

// FoodStory-style display code for tables (FD22_201 ...)
export function tableDisplayCode(name: string): string {
  const letter = name[0];
  const num = parseInt(name.slice(1), 10);
  const base: Record<string, number> = { A: 200, B: 300, C: 400, V: 500 };
  const start = base[letter] ?? 100;
  return `FD22_${start + num}`;
}
export const BRANCH_NAME = "สาขาหลัก";

// --- Tables ---
let tnum = 0;
function mkT(zone: string, letter: string, capacity: number, qrType: "static" | "dynamic" = "static"): Table {
  const local = ++tnum;
  return {
    id: `t_${zone}_${local}`,
    name: `${letter}${local}`,
    zone,
    capacity,
    qrType,
    isActive: true,
  };
}
// reset for each zone
function genZone(zone: string, letter: string, count: number, capacity: number): Table[] {
  tnum = 0;
  return Array.from({ length: count }, () => mkT(zone, letter, capacity));
}

export const tables: Table[] = [
  ...genZone("ในร้าน", "A", 8, 4),
  ...genZone("นอกร้าน", "B", 6, 4),
  ...genZone("ชั้น 2", "C", 5, 6),
  ...genZone("VIP", "V", 1, 10).map((t) => ({ ...t, qrType: "dynamic" as const })),
];

// --- Expense Categories (icon = semantic key) ---
export const expenseCategories: ExpenseCategory[] = [
  { id: "ec_salary", name: "ค่าแรง", icon: "salary" },
  { id: "ec_rent", name: "ค่าเช่า", icon: "rent" },
  { id: "ec_utility", name: "ค่าน้ำ/ไฟ/แก๊ส", icon: "utility" },
  { id: "ec_packaging", name: "ค่า Packaging", icon: "packaging" },
  { id: "ec_repair", name: "ค่าซ่อมบำรุง", icon: "repair" },
  { id: "ec_marketing", name: "การตลาด", icon: "marketing" },
  { id: "ec_other", name: "อื่นๆ", icon: "other" },
];

// --- Expenses (this month) ---
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");

function expDate(day: number): string {
  return `${yyyy}-${mm}-${String(day).padStart(2, "0")}`;
}

export const expenses: Expense[] = [
  { id: "e_1", categoryId: "ec_salary", amount: 75000, note: "เงินเดือนพนักงาน 5 คน", date: expDate(1), createdBy: "Owner" },
  { id: "e_2", categoryId: "ec_rent", amount: 45000, note: "ค่าเช่าเดือนนี้", date: expDate(1), createdBy: "Owner" },
  { id: "e_3", categoryId: "ec_utility", amount: 8500, note: "ค่าไฟฟ้า", date: expDate(3), createdBy: "Owner" },
  { id: "e_4", categoryId: "ec_utility", amount: 2200, note: "ค่าน้ำประปา", date: expDate(3), createdBy: "Owner" },
  { id: "e_5", categoryId: "ec_utility", amount: 3800, note: "ค่าแก๊ส", date: expDate(5), createdBy: "Owner" },
  { id: "e_6", categoryId: "ec_packaging", amount: 4200, note: "กล่องห่อกลับบ้าน + ช้อนพลาสติก", date: expDate(7), createdBy: "Manager" },
  { id: "e_7", categoryId: "ec_repair", amount: 1500, note: "ซ่อมเตาแก๊ส", date: expDate(12), createdBy: "Manager" },
  { id: "e_8", categoryId: "ec_marketing", amount: 5000, note: "โปรโมท Facebook", date: expDate(15), createdBy: "Owner" },
  { id: "e_9", categoryId: "ec_packaging", amount: 2800, note: "กระดาษเช็ดปาก + ถุงพลาสติก", date: expDate(18), createdBy: "Manager" },
  { id: "e_10", categoryId: "ec_other", amount: 1200, note: "ของใช้สิ้นเปลือง", date: expDate(20), createdBy: "Manager" },
];

// --- Aggregated sales data (this month) ---
// Revenue: total = sum(menus[i].price * menus[i].soldCount)
export const monthlySalesByDay: { day: number; revenue: number; orders: number }[] = (() => {
  const days = today.getDate();
  const result: { day: number; revenue: number; orders: number }[] = [];
  // Generate a realistic-looking pattern: weekday baseline + weekend spike + slight upward trend
  for (let d = 1; d <= days; d++) {
    const date = new Date(yyyy, today.getMonth(), d);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 18000 : 12000;
    const noise = (Math.sin(d * 1.7) + Math.cos(d * 0.9)) * 1500;
    const trend = d * 80;
    const revenue = Math.max(6000, Math.floor(base + noise + trend));
    const orders = Math.max(20, Math.floor(revenue / 320));
    result.push({ day: d, revenue, orders });
  }
  return result;
})();

// Hourly sales (today)
export const hourlySalesToday: { hour: number; revenue: number; orders: number }[] = (() => {
  const result: { hour: number; revenue: number; orders: number }[] = [];
  // Restaurant pattern: morning quiet, lunch peak 12-13, afternoon dip, dinner peak 18-20
  const pattern = [
    0, 0, 0, 0, 0, 0, 0, 0, // 0-7
    200, 800, 1500, 3200, 5800, 6400, 3200, 1800, // 8-15
    1500, 2400, 4800, 6800, 7200, 5400, 2400, 1200, // 16-23
  ];
  for (let h = 0; h < 24; h++) {
    const noise = Math.floor((Math.random() - 0.5) * 300);
    const revenue = Math.max(0, pattern[h] + noise);
    const orders = Math.floor(revenue / 250);
    result.push({ hour: h, revenue, orders });
  }
  return result;
})();

// --- Computed helpers ---
export function getCategoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

export function totalRevenueThisMonth(): number {
  return monthlySalesByDay.reduce((s, d) => s + d.revenue, 0);
}

export function totalOrdersThisMonth(): number {
  return monthlySalesByDay.reduce((s, d) => s + d.orders, 0);
}

export function totalCOGSThisMonth(): number {
  // approximation: sum of cost × soldCount across menus
  return menus.reduce((s, m) => s + m.cost * m.soldCount, 0);
}

export function totalExpensesThisMonth(): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function topMenus(limit = 5): MenuItem[] {
  return [...menus].sort((a, b) => b.soldCount - a.soldCount).slice(0, limit);
}

export function revenueByCategory(): { categoryId: string; name: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (const m of menus) {
    map.set(m.categoryId, (map.get(m.categoryId) ?? 0) + m.price * m.soldCount);
  }
  return Array.from(map.entries())
    .map(([cid, rev]) => ({
      categoryId: cid,
      name: getCategoryName(cid),
      revenue: rev,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function expensesByCategory(): { categoryId: string; name: string; icon: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
  }
  return expenseCategories
    .map((c) => ({
      categoryId: c.id,
      name: c.name,
      icon: c.icon,
      amount: map.get(c.id) ?? 0,
    }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// Today (last entry of monthlySalesByDay)
export const todaysRevenue = monthlySalesByDay[monthlySalesByDay.length - 1]?.revenue ?? 0;
export const todaysOrders = monthlySalesByDay[monthlySalesByDay.length - 1]?.orders ?? 0;

// "Active tables" / "pending orders" — show static realistic numbers
export const activeTablesNow = 6;
export const pendingOrdersNow = 4;

// --- Buffet Packages ---
export const packages: Package[] = [
  {
    id: "pkg_premium",
    name: "Premium Buffet",
    description:
      "บุฟเฟ่ต์ชาบูพรีเมียม วัตถุดิบนำเข้า เนื้อโกเบ A5 + กุ้งแม่น้ำ + อาหารทะเลสด",
    priceAdult: 399,
    priceChild: 199.5,
    childAgeMin: 6,
    childAgeMax: 12,
    durationMinutes: 120,
    lastOrderBefore: 15,
    extensionPrice: 100,
    extensionMinutes: 30,
    isActive: true,
    packageMenuIds: ["m_pad_pak", "m_water", "m_thai_tea", "m_gaeng_keaw"],
    addons: [
      { menuId: "m_pad_thai", price: 49 },
      { menuId: "m_tom_yum", price: 89 },
    ],
    ordersThisMonth: 86,
    revenueThisMonth: 86 * 399 + 86 * 199.5,
  },
  {
    id: "pkg_standard",
    name: "Standard Buffet",
    description: "บุฟเฟ่ต์ชาบูสุดคุ้ม เนื้อหมูพรีเมียม + ผักสด + เครื่องดื่ม",
    priceAdult: 299,
    priceChild: 149.5,
    childAgeMin: 6,
    childAgeMax: 12,
    durationMinutes: 90,
    lastOrderBefore: 10,
    extensionPrice: 75,
    extensionMinutes: 30,
    isActive: true,
    packageMenuIds: ["m_pad_pak", "m_water", "m_gaeng_keaw"],
    addons: [{ menuId: "m_pad_thai", price: 39 }],
    ordersThisMonth: 142,
    revenueThisMonth: 142 * 299 + 60 * 149.5,
  },
  {
    id: "pkg_kids",
    name: "Kids Set",
    description: "เซตเด็ก 90 นาที เน้นเมนูเด็ก ไม่เผ็ด",
    priceAdult: 159,
    priceChild: 99,
    childAgeMin: 3,
    childAgeMax: 12,
    durationMinutes: 90,
    lastOrderBefore: 10,
    extensionPrice: 0,
    extensionMinutes: 0,
    isActive: false,
    packageMenuIds: ["m_water", "m_thai_tea"],
    addons: [],
    ordersThisMonth: 0,
    revenueThisMonth: 0,
  },
];

export function getMenuById(id: string): MenuItem | undefined {
  return menus.find((m) => m.id === id);
}
