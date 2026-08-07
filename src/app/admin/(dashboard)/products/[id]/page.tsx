import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages, parseJsonObject } from "@/lib/data";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Edit Product</h1>
      <div className="mt-6 max-w-4xl">
        <AdminProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            shortDescription: product.shortDescription,
            description: product.description,
            basePrice: product.basePrice,
            compareAtPrice: product.compareAtPrice,
            images: parseImages(product.images),
            attributes: parseJsonObject(product.attributes),
            specifications: parseJsonObject(product.specifications),
            safetyWarnings: product.safetyWarnings,
            usageNotes: product.usageNotes,
            isBundle: product.isBundle,
            isFeatured: product.isFeatured,
            isNewArrival: product.isNewArrival,
            status: product.status,
            variants: product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              lowStockAt: v.lowStockAt,
              attributes: parseJsonObject(v.attributes),
            })),
          }}
        />
      </div>
    </div>
  );
}
