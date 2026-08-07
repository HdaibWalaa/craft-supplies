import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_THEME_SLUGS } from "@/lib/categories";
import { deleteCategory } from "@/app/actions/admin/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [categories, editing] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
    edit ? prisma.category.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Categories</h1>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200/70 bg-cream-50">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Theme</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-cream-100">
                <td className="px-4 py-3 font-medium text-ink-900">{c.name}</td>
                <td className="px-4 py-3 text-ink-500">{c.slug}</td>
                <td className="px-4 py-3 text-ink-600">{c.colorTheme}</td>
                <td className="px-4 py-3 text-ink-600">{c._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/categories?edit=${c.id}`} className="text-sm text-terracotta-700 hover:underline">
                      Edit
                    </Link>
                    <ConfirmDeleteButton action={deleteCategory} id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-2xl">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          {editing ? `Edit "${editing.name}"` : "Add Category"}
        </h2>
        <div className="mt-3">
          <CategoryForm
            themes={AVAILABLE_THEME_SLUGS}
            initial={editing ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
