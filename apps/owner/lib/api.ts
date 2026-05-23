// Typed API client for the Owner Console with bearer-token auth.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "plearn-owner-token";

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown, message?: string) {
    super(message ?? `API error ${status}`);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null): void {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json);
  return json as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Dashboard
  summary: () => request("/dashboard/summary"),
  sales: (params: Record<string, string> = {}) =>
    request("/dashboard/sales?" + new URLSearchParams(params).toString()),
  topMenus: (params: Record<string, string> = {}) =>
    request("/dashboard/top-menus?" + new URLSearchParams(params).toString()),
  pl: (params: Record<string, string> = {}) =>
    request("/dashboard/pl?" + new URLSearchParams(params).toString()),
  hourly: (params: Record<string, string> = {}) =>
    request("/dashboard/hourly?" + new URLSearchParams(params).toString()),

  // Menus
  menus: () => request("/menus"),
  saveMenu: (id: string | null, data: any) =>
    request(id ? `/menus/${id}` : "/menus", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(data),
    }),
  toggleMenu: (id: string) =>
    request(`/menus/${id}/availability`, { method: "PUT" }),

  // Categories
  categories: () => request("/categories"),
  saveCategory: (id: string | null, data: any) =>
    request(id ? `/categories/${id}` : "/categories", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(data),
    }),

  // Tables
  tables: () => request("/tables"),
  tableQr: (id: string) => request(`/tables/${id}/qr`),

  // Expenses
  expenseCategories: () => request("/expense-categories"),
  expenses: (params: Record<string, string> = {}) =>
    request("/expenses?" + new URLSearchParams(params).toString()),
  addExpense: (data: {
    category_id: string;
    amount: number;
    note?: string;
    expense_date: string;
  }) =>
    request("/expenses", { method: "POST", body: JSON.stringify(data) }),

  // Restaurant + settings
  restaurant: () => request("/restaurant"),
  saveSettings: (data: any) =>
    request("/restaurant/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
