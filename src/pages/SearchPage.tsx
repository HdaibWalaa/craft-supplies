import type { Metadata } from "@/types/metadata";
import { getShopProducts } from "@/lib/data";
import { ProductGrid } from "@/components/ProductRail";
import { FuzzySearchFallback } from "@/components/FuzzySearchFallback";
import { SearchBar } from "@/components/SearchBar";

export const metadata: Metadata = { title: "Search Results" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const { products, total } = q
    ? await getShopProducts({ query: q, pageSize: 24 })
    : { products: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Search</h1>
      <div className="mt-4 max-w-lg">
        <SearchBar autoFocus />
      </div>

      {!q ? (
        <p className="py-16 text-center text-ink-500">Start typing to search the shop.</p>
      ) : total > 0 ? (
        <div className="mt-8">
          <p className="mb-4 text-sm text-ink-500">
            {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="mt-8">
          <FuzzySearchFallback query={q} />
        </div>
      )}
    </div>
  );
}
