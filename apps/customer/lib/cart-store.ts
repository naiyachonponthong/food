"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, MenuOptionChoice } from "./mock-data";

export type SelectedOption = {
  optionId: string;
  optionName: string;
  choice: MenuOptionChoice;
};

export type CartItem = {
  id: string; // unique cart line id
  menuId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  note?: string;
  options: SelectedOption[];
};

export type PlacedOrderItem = CartItem & {
  status: "pending" | "confirmed" | "preparing" | "ready" | "served";
  orderedBy: string;
  orderedAt: number;
};

export type PlacedOrder = {
  id: string;
  orderNumber: string;
  roundNumber: number;
  placedAt: number;
  items: PlacedOrderItem[];
};

type Store = {
  cart: CartItem[];
  orders: PlacedOrder[];
  billRequested: boolean;
  callStaffActive: { reason: string; at: number } | null;

  // cart actions
  addToCart: (
    menu: MenuItem,
    quantity: number,
    options: SelectedOption[],
    note?: string,
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNote: (cartItemId: string, note: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // orders
  placeOrder: () => PlacedOrder | null;
  advanceMockStatus: () => void;

  // bill / staff
  requestBill: () => void;
  resetBill: () => void;
  callStaff: (reason: string) => void;
  clearStaffCall: () => void;

  // calc
  cartCount: () => number;
  cartSubtotal: () => number;
};

const lineSubtotal = (item: CartItem) =>
  (item.basePrice + item.options.reduce((s, o) => s + o.choice.priceAddon, 0)) *
  item.quantity;

const optionsSignature = (options: SelectedOption[]) =>
  options
    .map((o) => `${o.optionId}:${o.choice.id}`)
    .sort()
    .join("|");

export const useCartStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      billRequested: false,
      callStaffActive: null,

      addToCart: (menu, quantity, options, note) =>
        set((state) => {
          const sig = optionsSignature(options);
          const existingIndex = state.cart.findIndex(
            (it) =>
              it.menuId === menu.id &&
              optionsSignature(it.options) === sig &&
              (it.note || "") === (note || ""),
          );
          if (existingIndex >= 0) {
            const next = [...state.cart];
            next[existingIndex] = {
              ...next[existingIndex],
              quantity: next[existingIndex].quantity + quantity,
            };
            return { cart: next };
          }
          const newItem: CartItem = {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `c_${Date.now()}_${Math.random()}`,
            menuId: menu.id,
            name: menu.name,
            image: menu.image,
            basePrice: menu.price,
            quantity,
            note,
            options,
          };
          return { cart: [...state.cart, newItem] };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((it) => it.id !== id)
              : state.cart.map((it) =>
                  it.id === id ? { ...it, quantity } : it,
                ),
        })),

      updateNote: (id, note) =>
        set((state) => ({
          cart: state.cart.map((it) =>
            it.id === id ? { ...it, note } : it,
          ),
        })),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((it) => it.id !== id),
        })),

      clearCart: () => set({ cart: [] }),

      placeOrder: () => {
        const { cart, orders } = get();
        if (cart.length === 0) return null;
        const order: PlacedOrder = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `o_${Date.now()}`,
          orderNumber: `ORD-${String(orders.length + 1).padStart(4, "0")}`,
          roundNumber: orders.length + 1,
          placedAt: Date.now(),
          items: cart.map((it) => ({
            ...it,
            status: "pending",
            orderedBy: "ลูกค้า",
            orderedAt: Date.now(),
          })),
        };
        set({ orders: [...orders, order], cart: [] });
        return order;
      },

      // Demo: cycle item statuses to simulate kitchen flow
      advanceMockStatus: () =>
        set((state) => {
          const flow: PlacedOrderItem["status"][] = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "served",
          ];
          return {
            orders: state.orders.map((o) => ({
              ...o,
              items: o.items.map((it) => {
                const i = flow.indexOf(it.status);
                return {
                  ...it,
                  status: flow[Math.min(i + 1, flow.length - 1)],
                };
              }),
            })),
          };
        }),

      requestBill: () => set({ billRequested: true }),
      resetBill: () =>
        set({ billRequested: false, orders: [], cart: [] }),

      callStaff: (reason) =>
        set({ callStaffActive: { reason, at: Date.now() } }),
      clearStaffCall: () => set({ callStaffActive: null }),

      cartCount: () => get().cart.reduce((s, it) => s + it.quantity, 0),

      cartSubtotal: () => get().cart.reduce((s, it) => s + lineSubtotal(it), 0),
    }),
    {
      name: "plearn-cart-storage",
      partialize: (s) => ({
        cart: s.cart,
        orders: s.orders,
        billRequested: s.billRequested,
      }),
    },
  ),
);

export const calcLineSubtotal = lineSubtotal;
