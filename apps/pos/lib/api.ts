// Typed API client for the POS app with bearer-token auth.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "plearn-pos-token";

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
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
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  tables: () => request("/tables"),
  openSession: (table_id: string, opts: {
    guest_count?: number;
    guest_adult?: number;
    guest_child?: number;
    package_id?: string;
    qr_type?: "static" | "dynamic";
  }) =>
    request("/sessions", {
      method: "POST",
      body: JSON.stringify({ table_id, ...opts }),
    }),
  closeSession: (id: string) =>
    request(`/sessions/${id}/close`, { method: "PUT" }),
  sessionSummary: (id: string) => request(`/sessions/${id}/summary`),

  orders: (params: Record<string, string> = {}) =>
    request("/orders?" + new URLSearchParams(params).toString()),
  updateOrderStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  cancelOrder: (id: string, reason: string) =>
    request(`/orders/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  kitchen: () => request("/kitchen/queue"),
  updateItem: (id: string, status: string) =>
    request(`/kitchen/items/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  paymentForSession: (sessionId: string) =>
    request(`/payments/session/${sessionId}`),
  createPayment: (session_id: string, method: string) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify({ session_id, method }),
    }),
  markPaid: (id: string, amount_paid?: number) =>
    request(`/payments/${id}/pay`, {
      method: "PUT",
      body: JSON.stringify(amount_paid ? { amount_paid } : {}),
    }),
  qrPayment: (id: string) =>
    request(`/payments/${id}/qr`, { method: "POST" }),

  notifications: () => request("/notifications"),
  markNotifRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: "PUT" }),
};
