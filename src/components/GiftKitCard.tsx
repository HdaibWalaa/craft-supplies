import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { QuickAddButton } from "@/components/QuickAddButton";
import { parseImages } from "@/lib/parse";
import { formatPrice } from "@/lib/utils";

export type GiftKitProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  images: string | { url: string; alt?: string }[];
  basePrice: number;
  compareAtPrice: number | null;
  variants: { id: string; price: number; stock: number }[];
};

export function GiftKitCard({ product, includes }: { product: GiftKitProduct; includes: string[] }) {
  const image = parseImages(product.images)[0];
  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className="flex flex-col bg-cream-50">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[21/10] w-full overflow-hidden">
        <ProductImage
          src={image?.url ?? ""}
          alt={image?.alt ?? product.name}
          className="h-full w-full"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute bottom-3 left-3 bg-terracotta-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-50">
          Gift Set
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-xl font-semibold text-walnut-950">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-ink-600">{product.shortDescription}</p>

        {includes.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-terracotta-700">Includes</p>
            <ul className="mt-1.5 space-y-1">
              {includes.map((name) => (
                <li key={name} className="flex items-center gap-2 text-sm text-ink-600">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-terracotta-500" /> {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold text-walnut-950">
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-ink-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
          </div>
          {defaultVariant ? (
            <QuickAddButton
              variantId={defaultVariant.id}
              disabled={!inStock}
              className="rounded-md bg-sage-900 text-cream-50 hover:bg-sage-800"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
