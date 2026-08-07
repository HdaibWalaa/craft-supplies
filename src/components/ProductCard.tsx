import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { QuickAddButton } from "@/components/QuickAddButton";
import { Badge } from "@/components/ui/Badge";
import { parseImages } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  images: string;
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
  const images = parseImages(product.images);
  const defaultVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className={cn("group flex flex-col", className)}>
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-3xl">
        <ProductImage
          src={images[0]?.url ?? ""}
          alt={images[0]?.alt ?? product.name}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.isNewArrival ? <Badge variant="sage">New</Badge> : null}
          {product.isBundle ? <Badge variant="terracotta">Kit</Badge> : null}
          {product.compareAtPrice ? <Badge variant="red">Sale</Badge> : null}
          {!inStock ? <Badge variant="ink">Out of Stock</Badge> : null}
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
          <span className="font-semibold text-ink-900">{formatPrice(product.basePrice)}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-ink-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {defaultVariant ? (
          <QuickAddButton variantId={defaultVariant.id} disabled={!inStock} />
        ) : null}
      </div>
    </div>
  );
}
