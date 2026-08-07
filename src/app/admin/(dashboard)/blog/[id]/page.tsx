import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_THEME_SLUGS } from "@/lib/categories";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";

export const metadata: Metadata = { title: "Edit Blog Post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, products] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { relatedProducts: true } }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Edit Blog Post</h1>
      <div className="mt-6 max-w-3xl">
        <AdminBlogForm
          coverThemes={AVAILABLE_THEME_SLUGS}
          products={products}
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImageTheme: post.coverImageTheme,
            published: post.published,
            relatedProductIds: post.relatedProducts.map((r) => r.productId),
          }}
        />
      </div>
    </div>
  );
}
