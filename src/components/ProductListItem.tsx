import Link from "@/routing/Link";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { QuickAddButton } from "@/components/QuickAddButton";
import type { ProductCardData } from "@/components/ProductCard";
import { getProductPreviewImage } from "@/lib/parse";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function ProductListItem({ product }: { product: ProductCardData }) {
  const { locale } = useI18n();
  const image = getProductPreviewImage(product);
  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className="flex gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-3 shadow-[var(--shadow-card)] sm:gap-5 sm:p-4">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <ProductImage
          src={image?.url ?? ""}
          alt={image?.alt || product.name}
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
