import Link from "@/routing/Link";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { QuickAddButton } from "@/components/QuickAddButton";
import { Badge } from "@/components/ui/Badge";
import { getProductPreviewImage } from "@/lib/parse";
import { formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  images: string | { url: string; alt?: string }[];
  thumbnail?: { url: string; alt?: string } | null;
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBundle: boolean;
  variants: { id: string; price: number; stock: number }[];
};

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const image = getProductPreviewImage(product);
  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className={cn("group flex flex-col", className)}>
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-3xl">
        <ProductImage
          src={image?.url ?? ""}
          alt={image?.alt || product.name}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute start-2 top-2 flex flex-col gap-1.5">
          {product.isNewArrival ? <Badge variant="sage">{t("new")}</Badge> : null}
          {product.isBundle ? <Badge variant="terracotta">{t("kit")}</Badge> : null}
          {product.compareAtPrice ? <Badge variant="terracotta">{t("sale")}</Badge> : null}
          {!inStock ? <Badge variant="ink">{t("outOfStock")}</Badge> : null}
        </div>
      </Link>

      <Link href={`/product/${product.slug}`} className="mt-3">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-ink-900 group-hover:text-terracotta-700">
          {product.name}
        </h3>
      </Link>
      <p className="line-clamp-1 text-sm text-ink-500">{product.shortDescription}</p>

      <div className="mt-1.5">
        <StarRating rating={product.rating} count={product.reviewCount} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-ink-900">{formatPrice(product.basePrice, locale)}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-ink-400 line-through">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
          ) : null}
        </div>
        {defaultVariant ? (
          <QuickAddButton variantId={String(defaultVariant.id)} disabled={!inStock} />
        ) : null}
      </div>
    </div>
  );
}
