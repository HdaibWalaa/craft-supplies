import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { QuickAddButton } from "@/components/QuickAddButton";
import type { ProductCardData } from "@/components/ProductCard";
import { parseImages } from "@/lib/parse";
import { formatPrice } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";

export async function ProductListItem({ product }: { product: ProductCardData }) {
  const locale = await getLocale();
  const images = parseImages(product.images);
  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className="flex gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-3 shadow-[var(--shadow-card)] sm:gap-5 sm:p-4">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <ProductImage
          src={images[0]?.url ?? ""}
          alt={images[0]?.alt ?? product.name}
          className="h-28 w-28 rounded-xl sm:h-36 sm:w-36"
          sizes="150px"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-base font-semibold text-ink-900 hover:text-terracotta-700 sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{product.shortDescription}</p>
        <div className="mt-1.5">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-ink-900">{formatPrice(product.basePrice, locale)}</span>
            {product.compareAtPrice ? (
              <span className="text-sm text-ink-400 line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </div>
          {defaultVariant ? (
            <QuickAddButton variantId={defaultVariant.id} disabled={!inStock} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
