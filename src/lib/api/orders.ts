import { apiRequest } from "@/lib/api/client";
import type { ApiCollection } from "@/types/api";

export type ApiOrderStatus = "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
export type ApiOrder = {
  id: string; orderNumber: string; accessToken: string; email: string; status: ApiOrderStatus; paymentStatus: string; paymentMethod: string; shippingMethod: string;
  shippingAddress: Record<string, string>; subtotal: number; discountTotal: number; shippingTotal: number; taxTotal: number; total: number; currency: string;
  items: { id: string; productName: string; variantName: string; sku: string; unitPrice: number; quantity: number; subtotal: number }[]; createdAt: string;
};
export async function fetchOrders() { return (await apiRequest<ApiCollection<ApiOrder>>("orders", { cache: "no-store" })).data; }
export async function fetchOrder(orderNumber: string) { return (await apiRequest<{ data: ApiOrder }>(`orders/${encodeURIComponent(orderNumber)}`, { cache: "no-store" })).data; }
