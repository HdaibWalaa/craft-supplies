import { apiRequest } from "@/lib/api/client";
import type { ApiCategory, ApiResource } from "@/types/api";

export async function fetchCategories() {
  return apiRequest<{ data: ApiCategory[] }>("categories", { revalidate: 300 });
}

export async function fetchCategory(slug: string) {
  return apiRequest<ApiResource<ApiCategory>>(`categories/${encodeURIComponent(slug)}`, { revalidate: 300 });
}
