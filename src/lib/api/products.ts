import { apiRequest, type ApiQuery } from "@/lib/api/client";
import type { ApiCollection, ApiProduct, ApiResource } from "@/types/api";

export type ProductQuery = ApiQuery;

export async function fetchProducts(query: ProductQuery = {}) {
  return apiRequest<ApiCollection<ApiProduct>>("products", { query, revalidate: 60 });
}

export async function fetchProduct(slug: string) {
  return apiRequest<ApiResource<ApiProduct>>(`products/${encodeURIComponent(slug)}`, { revalidate: 60 });
}
