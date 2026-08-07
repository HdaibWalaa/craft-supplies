import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProduct } from "@/app/actions/admin/products";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200/70 bg-cream-50">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((p) => {
              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              const image = parseImages(p.images)[0];
              return (
                <tr key={p.id} className="hover:bg-cream-100">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <ProductImage src={image?.url ?? ""} alt={p.name} className="h-10 w-10 shrink-0 rounded-md" />
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-ink-900 hover:text-terracotta-700">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.category.name}</td>
                  <td className="px-4 py-3 text-ink-800">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span className={totalStock === 0 ? "text-red-600" : totalStock <= 10 ? "text-terracotta-700" : "text-ink-700"}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "active" ? "sage" : "ink"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}`} className="text-sm text-terracotta-700 hover:underline">
                        Edit
                      </Link>
                      <ConfirmDeleteButton action={deleteProduct} id={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 ? <p className="p-8 text-center text-ink-400">No products yet.</p> : null}
      </div>
    </div>
  );
}
