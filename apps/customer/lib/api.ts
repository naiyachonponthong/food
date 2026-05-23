// Lightweight typed API client for the customer PWA. Uses fetch + token
// (when staff embeds the app) or session token (public endpoints).

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json);
  return json as T;
}

// --- Public (customer) endpoints — keyed by session token ---
export const customerApi = {
  restaurant: (token: string) => request(`/public/${token}/restaurant`),
  menus: (token: string) => request(`/public/${token}/menus`),
  package: (token: string) => request(`/public/${token}/package`),
  myOrders: (token: string) => request(`/public/${token}/orders`),
  placeOrder: (
    token: string,
    items: {
      menu_id: string;
      quantity: number;
      note?: string;
      options?: { choice_id: string }[];
    }[],
    note?: string,
  ) =>
    request(`/public/${token}/orders`, {
      method: "POST",
      body: JSON.stringify({ items, note }),
    }),
  callStaff: (token: string, reason: string) =>
    request(`/public/${token}/call-staff`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  requestBill: (token: string) =>
    request(`/public/${token}/bill`, { method: "POST" }),
  getBill: (token: string) => request(`/public/${token}/bill`),
};

export const api = { request, customerApi };
