import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { ProductGrid } from "@/components/ProductRail";
import type { ProductCardData } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api/products";
import { getProductPreviewImage } from "@/lib/parse";

type IndexEntry = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  image: string;
  categoryName: string;
};

export function FuzzySearchFallback({ query }: { query: string }) {
  const [results, setResults] = useState<IndexEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const products = (await fetchProducts({ per_page: 48 })).data;
      const index: IndexEntry[] = products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, shortDescription: product.shortDescription, price: product.basePrice, image: getProductPreviewImage(product)?.url ?? "", categoryName: product.category.name }));
      const fuse = new Fuse(index, {
        keys: ["name", "shortDescription", "categoryName"],
        threshold: 0.4,
        ignoreLocation: true,
      });
      const matches = fuse.search(query).map((r) => r.item);
      if (!cancelled) setResults(matches);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (results === null) {
    return <p className="py-10 text-center text-sm text-ink-400">Searching...</p>;
  }

  if (results.length === 0) {
    return (
      <p className="py-16 text-center text-ink-500">
        No products found for &ldquo;{query}&rdquo;. Try a different search term.
      </p>
    );
  }

  const asProductCards: ProductCardData[] = results.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.shortDescription,
    basePrice: r.price,
    compareAtPrice: null,
    images: JSON.stringify([{ url: r.image, alt: r.name }]),
    rating: 0,
    reviewCount: 0,
    isNewArrival: false,
    isBundle: false,
    variants: [],
  }));

  return (
    <div>
      <p className="mb-4 text-sm text-ink-500">
        No exact matches — showing closest results for &ldquo;{query}&rdquo;
      </p>
      <ProductGrid products={asProductCards} />
    </div>
  );
}
