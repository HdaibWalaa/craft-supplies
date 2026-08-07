import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_THEME_SLUGS } from "@/lib/categories";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";

export const metadata: Metadata = { title: "New Blog Post" };

export default async function NewBlogPostPage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">New Blog Post</h1>
      <div className="mt-6 max-w-3xl">
        <AdminBlogForm coverThemes={AVAILABLE_THEME_SLUGS} products={products} />
      </div>
    </div>
  );
}
