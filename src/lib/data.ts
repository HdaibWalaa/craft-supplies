import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export { parseImages, parseJsonObject } from "@/lib/parse";

const PRODUCT_CARD_INCLUDE = {
  variants: { select: { id: true, price: true, stock: true }, orderBy: { price: "asc" as const } },
} satisfies Prisma.ProductInclude;

export function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "active", isFeatured: true },
    include: PRODUCT_CARD_INCLUDE,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { status: "active", isNewArrival: true },
    include: PRODUCT_CARD_INCLUDE,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { status: "active" },
    include: {
      ...PRODUCT_CARD_INCLUDE,
      category: { select: { name: true, slug: true } },
    },
    take: limit,
    orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
  });
}

export async function getHeroProduct() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { heroProduct: { include: PRODUCT_CARD_INCLUDE } },
  });
  if (settings?.heroProduct && settings.heroProduct.status === "active") {
    return settings.heroProduct;
  }
  return prisma.product.findFirst({
    where: { status: "active" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
  });
}

export function getBundles(limit = 4) {
  return prisma.product.findMany({
    where: { status: "active", isBundle: true },
    include: PRODUCT_CARD_INCLUDE,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export type ShopSort = "newest" | "price-asc" | "price-desc" | "rating" | "popularity";

const SORT_MAP: Record<ShopSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ basePrice: "asc" }],
  "price-desc": [{ basePrice: "desc" }],
  rating: [{ rating: "desc" }],
  popularity: [{ reviewCount: "desc" }],
};

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
  const { categorySlug, minPrice, maxPrice, inStockOnly, sort = "newest", page = 1, pageSize = 12, query } = opts;

  const where: Prisma.ProductWhereInput = {
    status: "active",
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(minPrice !== undefined ? { basePrice: { gte: minPrice } } : {}),
    ...(maxPrice !== undefined ? { basePrice: { ...(minPrice !== undefined ? { gte: minPrice } : {}), lte: maxPrice } } : {}),
    ...(inStockOnly ? { variants: { some: { stock: { gt: 0 } } } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { shortDescription: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_CARD_INCLUDE,
      orderBy: SORT_MAP[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { price: "asc" } },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
  return product;
}

export function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { status: "active", categoryId, id: { not: excludeId } },
    include: PRODUCT_CARD_INCLUDE,
    take: limit,
    orderBy: { rating: "desc" },
  });
}

export async function getBundleComponents(bundleItemIds: string | null) {
  if (!bundleItemIds) return [];
  let ids: string[] = [];
  try {
    ids = JSON.parse(bundleItemIds);
  } catch {
    return [];
  }
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: ids } },
    include: PRODUCT_CARD_INCLUDE,
  });
}

export function getBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      relatedProducts: {
        include: { product: { include: PRODUCT_CARD_INCLUDE } },
      },
    },
  });
  return post;
}
