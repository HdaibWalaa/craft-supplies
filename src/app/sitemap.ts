import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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

  const [categories, products, posts] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ where: { status: "active" }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, publishedAt: true } }),
  ]);

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
      lastModified: p.updatedAt,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.publishedAt,
    })),
  ];
}
