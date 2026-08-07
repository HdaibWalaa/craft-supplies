import type { Metadata } from "next";
import { getCategories, getShopProducts, type ShopSort } from "@/lib/data";
import { ShopFilters } from "@/components/ShopFilters";
import { ProductGrid } from "@/components/ProductRail";
import { ProductListItem } from "@/components/ProductListItem";
import { Pagination } from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Shop All Craft Supplies",
  description:
    "Browse the full catalog of candle, resin, soap, mold, fragrance, concrete, and wood craft supplies.",
};

type SearchParams = {
  category?: string;
  min?: string;
  max?: string;
  stock?: string;
  sort?: string;
  page?: string;
  view?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const categories = await getCategories();

  const page = Math.max(1, Number(sp.page) || 1);
  const view = sp.view === "list" ? "list" : "grid";

  const { products, total, pageCount } = await getShopProducts({
    categorySlug: sp.category && sp.category !== "all" ? sp.category : undefined,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    inStockOnly: sp.stock === "true",
    sort: (sp.sort as ShopSort) || "newest",
    page,
  });

  function buildHref(p: number) {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set("page", String(p));
    return `/shop?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Shop All Supplies</h1>
        <p className="mt-1 text-sm text-ink-500">{total} products</p>
      </div>

      <ShopFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

      {products.length === 0 ? (
        <p className="py-16 text-center text-ink-500">
          No products match those filters. Try widening your price range or clearing filters.
        </p>
      ) : view === "list" ? (
        <div className="flex flex-col gap-4">
          {products.map((p) => (
            <ProductListItem key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
    </div>
  );
}
