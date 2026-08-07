import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroProductPicker } from "@/components/admin/HeroProductPicker";

export const metadata: Metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      select: { id: true, name: true, images: true, rating: true, reviewCount: true },
      orderBy: { name: "asc" },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Homepage</h1>
      <p className="mt-1 text-sm text-ink-500">
        Choose which product appears in the storefront hero, with its photo and rating shown in
        the floating &ldquo;Best Seller&rdquo; card.
      </p>

      <div className="mt-6">
        <HeroProductPicker products={products} currentId={settings?.heroProductId ?? null} />
        {products.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-400">
            No active products yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
