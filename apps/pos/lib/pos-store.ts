"use client";

import { create } from "zustand";
import {
  initialNotifications,
  orders as seedOrders,
  POSSIBLE_NOTIFICATIONS,
  sessions as seedSessions,
  tables as seedTables,
  type Notification,
  type Order,
  type OrderItem,
  type OrderItemStatus,
  type Session,
  type Table,
  type TableStatus,
} from "./mock-data";

type State = {
  tables: Table[];
  sessions: Session[];
  orders: Order[];
  notifications: Notification[];
  selectedTableId: string | null;
  drawerOpen: boolean;
  openTableModal: boolean;

  // selectors
  unreadCount: () => number;
  activeSessionForTable: (tableId: string) => Session | null;
  ordersForTable: (tableId: string) => Order[];

  // actions
  selectTable: (tableId: string | null) => void;
  setDrawer: (open: boolean) => void;
  setOpenTableModal: (open: boolean) => void;

  openTable: (
    tableId: string,
    guestCount: number,
    qrType: "static" | "dynamic",
  ) => void;
  closeTable: (tableId: string) => void;

  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
  cancelOrder: (orderId: string, reason: string) => void;

  markNotificationsRead: (ids?: string[]) => void;
  clearNotification: (id: string) => void;

  // mock simulators
  triggerRandomEvent: () => void;
  ackCallStaff: (sessionId: string) => void;
  markBillPaid: (sessionId: string) => void;
};

let nextIdCounter = 100;
const nextId = (prefix: string) => `${prefix}_${++nextIdCounter}`;

function deriveOrderStatus(items: OrderItem[]): Order["status"] {
  if (items.every((i) => i.status === "cancelled")) return "cancelled";
  if (items.every((i) => i.status === "served")) return "served";
  if (items.some((i) => i.status === "preparing")) return "preparing";
  if (items.some((i) => i.status === "ready")) return "ready";
  if (items.every((i) => i.status === "confirmed" || i.status === "served"))
    return "confirmed";
  return "pending";
}

export const usePosStore = create<State>((set, get) => ({
  tables: seedTables,
  sessions: seedSessions,
  orders: seedOrders,
  notifications: initialNotifications,
  selectedTableId: null,
  drawerOpen: false,
  openTableModal: false,

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,

  activeSessionForTable: (tableId) =>
    get().sessions.find((s) => s.tableId === tableId) ?? null,

  ordersForTable: (tableId) =>
    get()
      .orders.filter((o) => o.tableId === tableId)
      .sort((a, b) => b.placedAt - a.placedAt),

  selectTable: (id) => set({ selectedTableId: id, drawerOpen: !!id }),
  setDrawer: (open) => set({ drawerOpen: open }),
  setOpenTableModal: (open) => set({ openTableModal: open }),

  openTable: (tableId, guestCount, qrType) =>
    set((state) => {
      const table = state.tables.find((t) => t.id === tableId);
      if (!table) return state;
      const sessionId = nextId("s");
      const session: Session = {
        id: sessionId,
        tableId,
        tableName: table.name,
        guestCount,
        openedAt: Date.now(),
        staff: "พนักงาน Nawawat",
        totalAmount: 0,
        itemsCount: 0,
      };
      return {
        tables: state.tables.map((t) =>
          t.id === tableId ? { ...t, status: "occupied", qrType } : t,
        ),
        sessions: [...state.sessions, session],
        openTableModal: false,
        selectedTableId: tableId,
        drawerOpen: true,
      };
    }),

  closeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: "available" } : t,
      ),
      sessions: state.sessions.filter((s) => s.tableId !== tableId),
      orders: state.orders.filter((o) => o.tableId !== tableId),
      drawerOpen: false,
      selectedTableId: null,
    })),

  updateOrderItemStatus: (orderId, itemId, status) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const items = o.items.map((it) =>
          it.id === itemId ? { ...it, status } : it,
        );
        return { ...o, items, status: deriveOrderStatus(items) };
      }),
    })),

  cancelOrder: (orderId, reason) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              items: o.items.map((it) => ({ ...it, status: "cancelled" })),
            }
          : o,
      ),
    })),

  markNotificationsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        !ids || ids.includes(n.id) ? { ...n, isRead: true } : n,
      ),
    })),

  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  triggerRandomEvent: () =>
    set((state) => {
      const pick =
        POSSIBLE_NOTIFICATIONS[
          Math.floor(Math.random() * POSSIBLE_NOTIFICATIONS.length)
        ];
      const newNotif: Notification = {
        ...pick,
        id: nextId("n"),
        at: Date.now(),
        isRead: false,
      };
      return { notifications: [newNotif, ...state.notifications].slice(0, 25) };
    }),

  ackCallStaff: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, hasCallStaff: undefined } : s,
      ),
    })),

  markBillPaid: (sessionId) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;
      return {
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        tables: state.tables.map((t) =>
          t.id === session.tableId ? { ...t, status: "available" } : t,
        ),
        orders: state.orders.filter((o) => o.sessionId !== sessionId),
        notifications: [
          {
            id: nextId("n"),
            type: "payment-received",
            title: "ชำระเงินเรียบร้อย",
            body: `โต๊ะ ${session.tableName} · ฿${session.totalAmount}`,
            tableName: session.tableName,
            at: Date.now(),
            isRead: false,
          },
          ...state.notifications,
        ],
        drawerOpen: false,
        selectedTableId: null,
      };
    }),
}));

export type { Order, OrderItem, Session, Table, TableStatus };
