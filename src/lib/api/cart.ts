import { cookies } from "next/headers";
import { apiRequest, ApiError } from "@/lib/api/client";
import type { ApiProduct, ApiProductVariant, ApiResource } from "@/types/api";

export type ApiCart = {
  id: string;
  token: string;
  items: { id: string; quantity: number; unitPrice: number; lineTotal: number; product: ApiProduct; variant: ApiProductVariant }[];
  itemCount: number;
  subtotal: number;
};

async function cartHeaders() {
  const token = (await cookies()).get("cart_token")?.value;
  return token ? { "X-Cart-Token": token } : undefined;
}

export async function fetchCart() {
  if (!(await cookies()).has("cart_token")) return null;
  return (await apiRequest<ApiResource<ApiCart>>("cart", { headers: await cartHeaders(), cache: "no-store" })).data;
}

export async function addCartItem(variantId: string, quantity: number) {
  return (await apiRequest<ApiResource<ApiCart>>("cart/items", { method: "POST", headers: await cartHeaders(), body: JSON.stringify({ variant_id: Number(variantId), quantity }), cache: "no-store" })).data;
}

export async function updateCartItem(itemId: string, quantity: number) {
  return (await apiRequest<ApiResource<ApiCart>>(`cart/items/${itemId}`, { method: "PATCH", headers: await cartHeaders(), body: JSON.stringify({ quantity }), cache: "no-store" })).data;
}

export async function deleteCartItem(itemId: string) {
  return apiRequest<{ message: string }>(`cart/items/${itemId}`, { method: "DELETE", headers: await cartHeaders(), cache: "no-store" });
}

export { ApiError };
