import { ApiError } from "@/lib/api/client";
import { fetchCategories, fetchCategory } from "@/lib/api/categories";
import { fetchProduct, fetchProducts } from "@/lib/api/products";
import { fetchBlogPost, fetchBlogPosts } from "@/lib/api/blog";
import type { ApiProduct } from "@/types/api";

export { parseImages, parseJsonObject } from "@/lib/parse";

export type ShopSort = "newest" | "price-asc" | "price-desc" | "rating" | "popularity";

const SORT_MAP: Record<ShopSort, string> = {
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  rating: "rating",
  popularity: "popularity",
};

export async function getCategories() {
  return (await fetchCategories()).data;
}

export async function getCategoryBySlug(slug: string) {
  try {
    return (await fetchCategory(slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function getProductCollection(query: Parameters<typeof fetchProducts>[0]) {
  return (await fetchProducts(query)).data;
}

export function getFeaturedProducts(limit = 8) {
  return getProductCollection({ featured: true, per_page: limit });
}

export function getNewArrivals(limit = 8) {
  return getProductCollection({ new_arrival: true, per_page: limit });
}

export function getBestSellers(limit = 8) {
  return getProductCollection({ sort: "popularity", per_page: limit });
}

export async function getHeroProduct() {
  return (await getBestSellers(1))[0] ?? null;
}

export function getBundles(limit = 4) {
  return getProductCollection({ bundle: true, per_page: limit });
}

export async function getShopProducts(opts: {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: ShopSort;
  page?: number;
  pageSize?: number;
  query?: string;
}) {
  const result = await fetchProducts({
    category: opts.categorySlug,
    min_price: opts.minPrice,
    max_price: opts.maxPrice,
    in_stock: opts.inStockOnly || undefined,
    sort: SORT_MAP[opts.sort ?? "newest"],
    page: opts.page ?? 1,
    per_page: opts.pageSize ?? 12,
    q: opts.query,
  });
  return {
    products: result.data,
    total: result.meta.total,
    page: result.meta.current_page,
    pageSize: result.meta.per_page,
    pageCount: Math.max(1, result.meta.last_page),
  };
}

export async function getProductBySlug(slug: string) {
  try {
    return (await fetchProduct(slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  const products = await getProductCollection({ per_page: limit + 1 });
  return products.filter((product) => product.categoryId === categoryId && product.id !== excludeId).slice(0, limit);
}

export async function getBundleComponents(bundleItemIds: string | null | undefined) {
  if (!bundleItemIds) return [];
  let ids: string[] = [];
  try {
    ids = JSON.parse(bundleItemIds) as string[];
  } catch {
    return [];
  }
  if (ids.length === 0) return [];
  const products = await getProductCollection({ per_page: 48 });
  return products.filter((product) => ids.includes(product.id));
}

// Blog endpoints are migrated in the content phase. Keeping their existing
// Prisma-backed functions separate prevents catalog calls from regressing.
export async function getBlogPosts() {
  return (await fetchBlogPosts()).data;
}

export async function getBlogPostBySlug(slug: string) {
  try {
    return (await fetchBlogPost(slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type StorefrontProduct = ApiProduct;
