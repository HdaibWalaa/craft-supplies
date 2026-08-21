import { apiRequest } from "@/lib/api/client";

export type ApiShippingMethod = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_default: boolean;
  zone: { id: number; name: string; slug: string };
};

export type ApiGovernorate = { code: string; label: string };

export async function fetchShippingMethods(governorate: string) {
  return (await apiRequest<{ data: ApiShippingMethod[] }>("shipping-methods", { query: { governorate }, cache: "no-store" })).data;
}

export async function fetchJordanGovernorates() {
  return (await apiRequest<{ data: ApiGovernorate[] }>("jordan-governorates", { revalidate: 86400 })).data;
}
