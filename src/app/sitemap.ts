import type { MetadataRoute } from "next";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import { fetchBlogPosts } from "@/lib/api/blog";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/blog",
  "/about",
  "/contact",
  "/faq",
  "/shipping-returns",
  "/terms",
  "/privacy",
  "/search",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [categoryResponse, productResponse, blogResponse] = await Promise.all([
    fetchCategories(),
    fetchProducts({ per_page: 48 }),
    fetchBlogPosts(),
  ]);
  const categories = categoryResponse.data;
  const products = productResponse.data;
  const posts = blogResponse.data;

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
    })),
  ];
}
