"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setToken } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "cashier" | "waiter" | "kitchen";
  restaurant_id: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
};

type Store = {
  user: AuthUser | null;
  token: string | null;
  status: "idle" | "loading" | "error";
  errorMessage: string | null;

  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  rehydrate: () => Promise<void>;
};

export const useAuthStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: "idle",
      errorMessage: null,

      login: async (email, password) => {
        set({ status: "loading", errorMessage: null });
        try {
          const { user, token } = await api.login(email, password);
          setToken(token);
          set({ user: user as AuthUser, token, status: "idle" });
          return user as AuthUser;
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ";
          set({ status: "error", errorMessage: msg });
          throw e;
        }
      },

      logout: async () => {
        try {
          if (get().token) await api.logout();
        } catch {
          // ignore network error on logout
        }
        setToken(null);
        set({ user: null, token: null, status: "idle", errorMessage: null });
      },

      rehydrate: async () => {
        const t = get().token;
        if (!t) return;
        setToken(t);
        try {
          const { user } = (await api.me()) as { user: AuthUser };
          set({ user });
        } catch {
          // token invalid — clear
          setToken(null);
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "plearn-pos-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
