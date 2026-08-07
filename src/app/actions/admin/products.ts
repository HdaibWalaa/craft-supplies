"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  attributes: z.record(z.string(), z.string()),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
  categoryId: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  images: z.array(z.object({ url: z.string().min(1), alt: z.string() })),
  attributes: z.record(z.string(), z.string()),
  specifications: z.record(z.string(), z.string()),
  safetyWarnings: z.string().optional(),
  usageNotes: z.string().optional(),
  isBundle: z.boolean().default(false),
  bundleItemIds: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  variants: z.array(variantSchema).min(1, "Add at least one variant."),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductActionResult = { error?: string; productId?: string };

export async function saveProduct(input: ProductInput): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the product fields." };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  const payload = {
    name: data.name,
    slug,
    categoryId: data.categoryId,
    shortDescription: data.shortDescription,
    description: data.description,
    basePrice: data.basePrice,
    compareAtPrice: data.compareAtPrice || null,
    images: JSON.stringify(data.images),
    attributes: JSON.stringify(data.attributes),
    specifications: JSON.stringify(data.specifications),
    safetyWarnings: data.safetyWarnings || null,
    usageNotes: data.usageNotes || null,
    isBundle: data.isBundle,
    bundleItemIds: data.isBundle ? JSON.stringify(data.bundleItemIds) : null,
    isFeatured: data.isFeatured,
    isNewArrival: data.isNewArrival,
    status: data.status,
  };

  try {
    const product = data.id
      ? await prisma.product.update({ where: { id: data.id }, data: payload })
      : await prisma.product.create({ data: payload });

    const existingVariants = data.id
      ? await prisma.productVariant.findMany({ where: { productId: product.id } })
      : [];
    const submittedIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id));

    for (const existing of existingVariants) {
      if (!submittedIds.has(existing.id)) {
        await prisma.productVariant.delete({ where: { id: existing.id } }).catch(() => {});
      }
    }

    for (const v of data.variants) {
      const variantPayload = {
        productId: product.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        lowStockAt: v.lowStockAt,
        attributes: JSON.stringify(v.attributes),
      };
      if (v.id) {
        await prisma.productVariant.update({ where: { id: v.id }, data: variantPayload });
      } else {
        await prisma.productVariant.create({ data: variantPayload });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/product/${slug}`);
    return { productId: product.id };
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "A product with that slug or a variant SKU already exists." };
    }
    return { error: "Something went wrong saving this product." };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/products");
  return { success: true };
}
