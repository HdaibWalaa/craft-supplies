import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api/client";

export async function validateApiDiscount(code: string) {
  const token = (await cookies()).get("cart_token")?.value;
  return apiRequest<{ data: { valid: true; code: string; amount: number } }>("discounts/validate", {
    method: "POST", headers: token ? { "X-Cart-Token": token } : undefined, body: JSON.stringify({ code, cart_token: token }), cache: "no-store",
  });
}
