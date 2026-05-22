// Mock data for Plearn Kitchen — represents a realistic Thai restaurant
// All images use Unsplash for now; will be replaced by uploaded images via API in Part 4.

export type Restaurant = {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  logo: string;
  cover: string;
  serviceCharge: number;
  vatRate: number;
  hasVat: boolean;
  themeColor: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
};

export type MenuOptionChoice = {
  id: string;
  name: string;
  priceAddon: number;
  isDefault?: boolean;
};

export type MenuOption = {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelect: number;
  choices: MenuOptionChoice[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  nameEn: string;
  description: string;
  image: string;
  price: number;
  calories?: number;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
  options?: MenuOption[];
};

export type Session = {
  token: string;
  tableName: string;
  guestName: string;
  startedAt: Date;
};

// --- Restaurant ---
export const restaurant: Restaurant = {
  id: "rest_1",
  name: "ครัวเพลิน",
  nameEn: "Plearn Kitchen",
  tagline: "อาหารไทยรสมือแม่ ทำใหม่ทุกจาน",
  logo: "",
  cover:
    "",
  serviceCharge: 10,
  vatRate: 7,
  hasVat: true,
  themeColor: "#3B82F6",
};

// --- Categories (icon resolved via Icons.tsx) ---
export const categories: MenuCategory[] = [
  { id: "featured", name: "เมนูแนะนำ", nameEn: "Featured", icon: "featured" },
  { id: "rice", name: "ข้าวกับข้าว", nameEn: "Rice Dishes", icon: "rice" },
  { id: "noodle", name: "เส้น", nameEn: "Noodles", icon: "noodle" },
  { id: "stir-fry", name: "ผัด ๆ", nameEn: "Stir Fried", icon: "stir-fry" },
  { id: "soup", name: "ต้ม / แกง", nameEn: "Soup & Curry", icon: "soup" },
  { id: "salad", name: "ยำ / สลัด", nameEn: "Salad", icon: "salad" },
  { id: "drink", name: "เครื่องดื่ม", nameEn: "Drinks", icon: "drink" },
  { id: "dessert", name: "ของหวาน", nameEn: "Dessert", icon: "dessert" },
];

// --- Common Options ---
const spicyOption: MenuOption = {
  id: "opt_spicy",
  name: "ระดับความเผ็ด",
  isRequired: true,
  maxSelect: 1,
  choices: [
    { id: "spicy_0", name: "ไม่เผ็ด", priceAddon: 0 },
    { id: "spicy_1", name: "เผ็ดน้อย", priceAddon: 0, isDefault: true },
    { id: "spicy_2", name: "เผ็ดกลาง", priceAddon: 0 },
    { id: "spicy_3", name: "เผ็ดมาก", priceAddon: 0 },
  ],
};

const eggOption: MenuOption = {
  id: "opt_egg",
  name: "เพิ่มไข่",
  isRequired: false,
  maxSelect: 1,
  choices: [
    { id: "egg_none", name: "ไม่เพิ่ม", priceAddon: 0, isDefault: true },
    { id: "egg_fried", name: "ไข่ดาว", priceAddon: 15 },
    { id: "egg_scram", name: "ไข่เจียว", priceAddon: 20 },
    { id: "egg_runny", name: "ไข่ดาวไข่แดงเยิ้ม", priceAddon: 20 },
  ],
};

const portionOption: MenuOption = {
  id: "opt_portion",
  name: "ขนาดจาน",
  isRequired: true,
  maxSelect: 1,
  choices: [
    { id: "port_reg", name: "ปกติ", priceAddon: 0, isDefault: true },
    { id: "port_big", name: "พิเศษ", priceAddon: 30 },
  ],
};

// --- Menu Items ---
export const menus: MenuItem[] = [
  // Rice dishes
  {
    id: "m_pad_kra_pao",
    categoryId: "rice",
    name: "ผัดกะเพราหมูสับไข่ดาว",
    nameEn: "Pad Kra Pao Moo Sub",
    description: "หมูสับผัดใบกะเพรา รสจัดจ้าน เสิร์ฟพร้อมข้าวสวยร้อน ๆ และไข่ดาว",
    image: "",
    price: 89,
    calories: 620,
    tags: ["ขายดี", "เผ็ด"],
    isAvailable: true,
    isFeatured: true,
    spicyLevel: 2,
    options: [spicyOption, eggOption, portionOption],
  },
  {
    id: "m_khao_man_kai",
    categoryId: "rice",
    name: "ข้าวมันไก่ต้ม",
    nameEn: "Hainanese Chicken Rice",
    description: "ไก่ต้มเนื้อนุ่ม ข้าวหุงน้ำมันไก่หอม น้ำจิ้มเต้าเจี้ยวสูตรพิเศษ",
    image: "",
    price: 75,
    calories: 540,
    tags: ["แนะนำ"],
    isAvailable: true,
    isFeatured: true,
    options: [portionOption],
  },
  {
    id: "m_khao_kha_moo",
    categoryId: "rice",
    name: "ข้าวขาหมูตุ๋นเปื่อย",
    nameEn: "Stewed Pork Leg Rice",
    description: "ขาหมูตุ๋นเครื่องยาจีน เคี่ยวนาน 6 ชม. เปื่อยนุ่ม หอมเครื่อง",
    image:
      "",
    price: 95,
    calories: 720,
    tags: ["ขายดี"],
    isAvailable: true,
    isFeatured: false,
  },
  // Noodles
  {
    id: "m_pad_thai",
    categoryId: "noodle",
    name: "ผัดไทยกุ้งสด",
    nameEn: "Pad Thai with Prawns",
    description: "เส้นจันท์ผัดสูตรเฉพาะ กุ้งสดตัวโต ถั่วงอกกรอบ บีบมะนาวสด ๆ",
    image:
      "",
    price: 129,
    calories: 580,
    tags: ["แนะนำ", "ยอดนิยม"],
    isAvailable: true,
    isFeatured: true,
    options: [portionOption],
  },
  {
    id: "m_ba_mee",
    categoryId: "noodle",
    name: "บะหมี่หมูแดงเกี๊ยว",
    nameEn: "Egg Noodle with BBQ Pork",
    description: "เส้นบะหมี่ไข่เหนียวนุ่ม หมูแดงหวานหอม เกี๊ยวกุ้งไส้แน่น",
    image:
      "",
    price: 79,
    calories: 510,
    tags: [],
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "m_yen_ta_fo",
    categoryId: "noodle",
    name: "เย็นตาโฟทรงเครื่อง",
    nameEn: "Yen Ta Fo",
    description: "เส้นเหนียวนุ่ม น้ำซุปสีชมพูรสกลมกล่อม เครื่องแน่นจุก ๆ",
    image:
      "",
    price: 85,
    calories: 480,
    tags: [],
    isAvailable: true,
    isFeatured: false,
  },
  // Stir-fry
  {
    id: "m_pad_see_ew",
    categoryId: "stir-fry",
    name: "ผัดซีอิ๊วหมู",
    nameEn: "Pad See Ew",
    description: "เส้นใหญ่ผัดซอสดำกลมกล่อม คะน้าสด ผัดไฟแรงหอมกระทะ",
    image:
      "",
    price: 89,
    tags: [],
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "m_pad_pak",
    categoryId: "stir-fry",
    name: "ผัดผักรวมน้ำมันหอย",
    nameEn: "Stir-Fried Mixed Vegetables",
    description: "ผักสด ๆ ตามฤดูกาล ผัดน้ำมันหอยเข้มข้น เหมาะกับสายเฮลตี้",
    image:
      "",
    price: 75,
    calories: 220,
    tags: ["เจ", "เฮลตี้"],
    isAvailable: true,
    isFeatured: false,
  },
  // Soup
  {
    id: "m_tom_yum",
    categoryId: "soup",
    name: "ต้มยำกุ้งน้ำข้น",
    nameEn: "Tom Yum Goong Creamy",
    description: "ต้มยำสูตรน้ำข้น กุ้งแม่น้ำตัวโต รสเปรี้ยว เผ็ด หอมสมุนไพรไทย",
    image:
      "",
    price: 189,
    calories: 350,
    tags: ["เผ็ด", "ซิกเนเจอร์"],
    isAvailable: true,
    isFeatured: true,
    spicyLevel: 3,
    options: [spicyOption],
  },
  {
    id: "m_gaeng_keaw",
    categoryId: "soup",
    name: "แกงเขียวหวานไก่",
    nameEn: "Green Curry Chicken",
    description: "พริกแกงตำมือ กะทิคั้นสด ไก่บ้านชิ้นโต มะเขือเปราะกรอบ",
    image:
      "",
    price: 99,
    tags: ["เผ็ด"],
    isAvailable: true,
    isFeatured: false,
    spicyLevel: 2,
  },
  // Salad
  {
    id: "m_som_tum",
    categoryId: "salad",
    name: "ส้มตำไทยกุ้งสด",
    nameEn: "Som Tum Thai with Prawns",
    description: "ส้มตำสูตรอีสาน ตำสด ๆ กุ้งแชบ๊วยสด รสจัดถึงเครื่อง",
    image:
      "",
    price: 89,
    tags: ["เผ็ด"],
    isAvailable: true,
    isFeatured: false,
    spicyLevel: 3,
    options: [spicyOption],
  },
  {
    id: "m_larb",
    categoryId: "salad",
    name: "ลาบหมูสับอีสาน",
    nameEn: "Larb Moo",
    description: "ลาบหมูสับสูตรอีสานแท้ ๆ ข้าวคั่วหอม โรยใบสะระแหน่",
    image: "",
    price: 95,
    tags: ["เผ็ด"],
    isAvailable: true,
    isFeatured: false,
    spicyLevel: 2,
  },
  // Drinks
  {
    id: "m_thai_tea",
    categoryId: "drink",
    name: "ชาเย็นรสไทย",
    nameEn: "Thai Iced Tea",
    description: "ชาเย็นสูตรเข้มข้น หวานพอดี เสิร์ฟพร้อมน้ำแข็งเย็นชื่นใจ",
    image:
      "",
    price: 45,
    tags: ["เย็น"],
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "m_lime_soda",
    categoryId: "drink",
    name: "โซดามะนาว",
    nameEn: "Lime Soda",
    description: "โซดาเย็น ๆ บีบมะนาวสด เปรี้ยวซ่า สดชื่น",
    image:
      "",
    price: 35,
    tags: ["เย็น"],
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "m_water",
    categoryId: "drink",
    name: "น้ำเปล่า",
    nameEn: "Bottled Water",
    description: "น้ำดื่มขวด 500ml เย็นจัด",
    image:
      "",
    price: 15,
    tags: [],
    isAvailable: true,
    isFeatured: false,
  },
  // Dessert
  {
    id: "m_mango_sticky",
    categoryId: "dessert",
    name: "ข้าวเหนียวมะม่วงน้ำดอกไม้",
    nameEn: "Mango Sticky Rice",
    description: "ข้าวเหนียวมูนกะทิเข้มข้น มะม่วงน้ำดอกไม้สุกพอดี หอมหวาน",
    image:
      "",
    price: 79,
    tags: ["ตามฤดูกาล"],
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "m_bua_loy",
    categoryId: "dessert",
    name: "บัวลอยไข่หวานกะทิสด",
    nameEn: "Bua Loy",
    description: "บัวลอยเหนียวนุ่ม ลอยในน้ำกะทิสด ใส่ไข่หวานสูตรโบราณ",
    image:
      "",
    price: 55,
    tags: [],
    isAvailable: false,
    isFeatured: false,
  },
];

// --- Active Session ---
export const session: Session = {
  token: "demo-session-token",
  tableName: "A6",
  guestName: "คุณ A",
  startedAt: new Date(),
};

// --- Call Staff Options (icon name = Lucide id, resolved in component) ---
export const callStaffOptions = [
  { id: "utensils", label: "ขออุปกรณ์", icon: "utensils", description: "ช้อน, ส้อม, ตะเกียบ" },
  { id: "seasoning", label: "ขอเครื่องปรุง", icon: "spice", description: "น้ำปลา, พริก, น้ำส้ม" },
  { id: "water", label: "เติมเครื่องดื่ม", icon: "water", description: "น้ำเปล่า, น้ำชา" },
  { id: "clean", label: "ทำความสะอาดโต๊ะ", icon: "clean", description: "เก็บจาน, เช็ดโต๊ะ" },
  { id: "other", label: "อื่น ๆ", icon: "other", description: "พิมพ์ข้อความบอกได้" },
];

// --- Helpers ---
export function getMenuById(id: string): MenuItem | undefined {
  return menus.find((m) => m.id === id);
}

export function getMenusByCategory(categoryId: string): MenuItem[] {
  if (categoryId === "featured") return menus.filter((m) => m.isFeatured);
  return menus.filter((m) => m.categoryId === categoryId);
}

export function getCategoryById(id: string): MenuCategory | undefined {
  return categories.find((c) => c.id === id);
}
