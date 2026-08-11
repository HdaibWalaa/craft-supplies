import { apiRequest } from "@/lib/api/client";
import type { ApiBlogPost, ApiCollection, ApiResource } from "@/types/api";

export function fetchBlogPosts() {
  return apiRequest<ApiCollection<ApiBlogPost>>("blog", { revalidate: 300 });
}

export function fetchBlogPost(slug: string) {
  return apiRequest<ApiResource<ApiBlogPost>>(`blog/${encodeURIComponent(slug)}`, { revalidate: 300 });
}
