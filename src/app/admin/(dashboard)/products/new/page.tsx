import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">New Product</h1>
      <div className="mt-6 max-w-4xl">
        <AdminProductForm categories={categories} />
      </div>
    </div>
  );
}
