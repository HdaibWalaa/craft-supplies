import { apiRequest } from "@/lib/api/client";
import type { ApiProduct } from "@/types/api";

export async function fetchWishlist() { return (await apiRequest<{ data: ApiProduct[] }>("wishlist", { cache: "no-store" })).data; }
export async function addWishlistProduct(productId: string) { return apiRequest("wishlist", { method: "POST", body: JSON.stringify({ product_id: Number(productId) }), cache: "no-store" }); }
export async function removeWishlistProduct(productId: string) { return apiRequest(`wishlist/${productId}`, { method: "DELETE", cache: "no-store" }); }
