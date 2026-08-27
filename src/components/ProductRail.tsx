import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export function ProductRail({ products }: { products: ProductCardData[] }) {
  return (
    <div className="-mx-4 max-w-[calc(100%+2rem)] overflow-hidden [contain:layout_paint] sm:mx-0 sm:max-w-full sm:overflow-visible sm:[contain:none]">
      <div className="flex w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            className="w-[65vw] shrink-0 snap-start sm:w-auto sm:shrink"
          />
        ))}
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
