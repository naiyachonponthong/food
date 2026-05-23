"use client";

import { create } from "zustand";
import { api } from "./api";
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
  apiReady: boolean;
  apiError: string | null;

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

  // API hydration
  hydrateFromApi: () => Promise<void>;
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
  apiReady: false,
  apiError: null,

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

  hydrateFromApi: async () => {
    try {
      const [tablesRes, ordersRes, notifsRes] = await Promise.all([
        api.tables() as Promise<{ tables: any[] }>,
        api.orders() as Promise<{ orders: { data: any[] } | any[] }>,
        api.notifications() as Promise<{ notifications: any[] }>,
      ]);

      // Map API → store types
      const tables: Table[] = tablesRes.tables.map((t: any) => ({
        id: t.id,
        number: t.number,
        name: t.name,
        capacity: t.capacity,
        zone: t.zone ?? "",
        qrType: t.qr_type,
        status: t.status,
      }));

      const sessions: Session[] = tablesRes.tables
        .filter((t: any) => t.active_session)
        .map((t: any) => {
          const s = t.active_session;
          return {
            id: s.id,
            tableId: t.id,
            tableName: t.name,
            guestCount: s.guest_count,
            openedAt: new Date(s.opened_at).getTime(),
            staff: "—",
            totalAmount: 0,
            itemsCount: 0,
            isBuffet: !!s.package_id,
            guestAdult: s.guest_adult,
            guestChild: s.guest_child,
          };
        });

      const ordersData = Array.isArray(ordersRes.orders)
        ? ordersRes.orders
        : (ordersRes.orders.data ?? []);
      const orders: Order[] = ordersData.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        roundNumber: o.round_number,
        tableId: o.session?.table?.id ?? "",
        tableName: o.session?.table?.name ?? "",
        sessionId: o.session_id,
        status: o.status,
        items: (o.items ?? []).map((it: any) => ({
          id: it.id,
          menuId: it.menu_id,
          name: it.name,
          price: Number(it.price),
          quantity: it.quantity,
          note: it.note ?? undefined,
          options: (it.options ?? []).map((op: any) => ({
            name: op.name,
            priceAddon: Number(op.price_addon),
          })),
          status: it.status,
          orderedBy: "—",
        })),
        total: Number(o.total),
        placedAt: new Date(o.created_at).getTime(),
      }));

      const notifications: Notification[] = notifsRes.notifications.map(
        (n: any) => ({
          id: n.id,
          type: (n.type as string).replace(/_/g, "-") as Notification["type"],
          title: n.title,
          body: n.body ?? "",
          tableName: n.data?.table_name ?? "—",
          at: new Date(n.created_at).getTime(),
          isRead: !!n.is_read,
        }),
      );

      set({ tables, sessions, orders, notifications, apiReady: true, apiError: null });
    } catch (e: unknown) {
      set({
        apiError: e instanceof Error ? e.message : "API hydrate failed",
      });
    }
  },
}));

export type { Order, OrderItem, Session, Table, TableStatus };
