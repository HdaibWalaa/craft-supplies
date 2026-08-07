import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getShopProducts, type ShopSort } from "@/lib/data";
import { getCategoryTheme } from "@/lib/categories";
import { getCategoryIcon } from "@/lib/category-icons";
import { ShopFilters } from "@/components/ShopFilters";
import { ProductGrid } from "@/components/ProductRail";
import { ProductListItem } from "@/components/ProductListItem";
import { Pagination } from "@/components/Pagination";

type SearchParams = {
  min?: string;
  max?: string;
  stock?: string;
  sort?: string;
  page?: string;
  view?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const view = sp.view === "list" ? "list" : "grid";
  const theme = getCategoryTheme(category.colorTheme);
  const Icon = getCategoryIcon(category.colorTheme);

  const { products, total, pageCount } = await getShopProducts({
    categorySlug: slug,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    inStockOnly: sp.stock === "true",
    sort: (sp.sort as ShopSort) || "newest",
    page,
  });

  function buildHref(p: number) {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set("page", String(p));
    return `/category/${slug}?${params.toString()}`;
  }

  return (
    <div>
      <div
        className="relative overflow-hidden py-14"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <Icon className="absolute -right-6 -top-6 h-40 w-40 text-white/15" strokeWidth={1} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-2 max-w-xl text-white/85">{category.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-4 text-sm text-ink-500">{total} products</p>
        <ShopFilters showCategoryFilter={false} />

        {products.length === 0 ? (
          <p className="py-16 text-center text-ink-500">
            No products match those filters yet. Try widening your price range.
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
    </div>
  );
}
