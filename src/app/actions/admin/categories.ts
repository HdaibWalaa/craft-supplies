"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  colorTheme: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryFormState = { error?: string };

export async function saveCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    colorTheme: formData.get("colorTheme"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the category fields." };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  try {
    if (data.id) {
      await prisma.category.update({
        where: { id: data.id },
        data: { name: data.name, slug, description: data.description, colorTheme: data.colorTheme, sortOrder: data.sortOrder },
      });
    } else {
      await prisma.category.create({
        data: { name: data.name, slug, description: data.description, colorTheme: data.colorTheme, sortOrder: data.sortOrder },
      });
    }
  } catch {
    return { error: "A category with that slug already exists." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return {};
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: `Can't delete — ${productCount} product(s) still use this category.` };
  }
  await prisma.category.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/categories");
  return { success: true };
}
