import { apiRequest } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";
import type { ApiOrder } from "@/lib/api/orders";

export async function submitCheckout(payload: Record<string, unknown>) {
  const cartToken = clientStorage.getCartToken();
  return (await apiRequest<{ data: { order: ApiOrder; checkout_url: string | null } }>("checkout", {
    method: "POST", headers: cartToken ? { "X-Cart-Token": cartToken } : undefined, body: JSON.stringify({ ...payload, cart_token: cartToken }), cache: "no-store",
  })).data;
}
export async function fetchCheckoutOrder(orderNumber: string, token: string) { return (await apiRequest<{ data: ApiOrder }>(`checkout/orders/${encodeURIComponent(orderNumber)}`, { query: { token }, cache: "no-store" })).data; }
