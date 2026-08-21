import { apiRequest, ApiError } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";
import type { ApiProduct, ApiProductVariant, ApiResource } from "@/types/api";

export type ApiCart = {
  id: string;
  token: string;
  items: { id: string; quantity: number; unitPrice: number; lineTotal: number; product: ApiProduct; variant: ApiProductVariant }[];
  itemCount: number;
  subtotal: number;
};

function cartHeaders() {
  const token = clientStorage.getCartToken();
  return token ? { "X-Cart-Token": token } : undefined;
}

export async function fetchCart() {
  if (!clientStorage.getCartToken() && !clientStorage.getAuthToken()) return null;
  return (await apiRequest<ApiResource<ApiCart>>("cart", { headers: cartHeaders(), cache: "no-store" })).data;
}

export async function addCartItem(variantId: string, quantity: number) {
  const cart = (await apiRequest<ApiResource<ApiCart>>("cart/items", { method: "POST", headers: cartHeaders(), body: JSON.stringify({ variant_id: Number(variantId), quantity }), cache: "no-store" })).data;
  if (cart.token) clientStorage.setCartToken(cart.token);
  return cart;
}

export async function updateCartItem(itemId: string, quantity: number) {
  return (await apiRequest<ApiResource<ApiCart>>(`cart/items/${itemId}`, { method: "PATCH", headers: cartHeaders(), body: JSON.stringify({ quantity }), cache: "no-store" })).data;
}

export async function deleteCartItem(itemId: string) {
  return apiRequest<{ message: string }>(`cart/items/${itemId}`, { method: "DELETE", headers: cartHeaders(), cache: "no-store" });
}

export { ApiError };
