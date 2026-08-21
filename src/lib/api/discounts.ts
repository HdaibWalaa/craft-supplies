import { apiRequest } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";

export async function validateApiDiscount(code: string) {
  const token = clientStorage.getCartToken();
  return apiRequest<{ data: { valid: true; code: string; amount: number } }>("discounts/validate", {
    method: "POST", headers: token ? { "X-Cart-Token": token } : undefined, body: JSON.stringify({ code, cart_token: token }), cache: "no-store",
  });
}
