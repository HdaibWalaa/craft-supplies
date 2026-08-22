import { useMemo, useState } from "react";
import Link from "@/routing/Link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { getProductPreviewImage } from "@/lib/parse";
import { formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export type BestSellerProduct = {
  id: string;
  slug: string;
  name: string;
  images: string | { url: string; alt?: string }[];
  thumbnail?: { url: string; alt?: string } | null;
  basePrice: number;
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  category: { name: string; slug: string } | null;
};

export function BestSellersSection({ products }: { products: BestSellerProduct[] }) {
  const { locale, t } = useI18n();
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      if (p.category && !seen.has(p.category.slug)) seen.set(p.category.slug, p.category.name);
    }
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const [active, setActive] = useState("all");
  const visible = active === "all" ? products : products.filter((p) => p.category?.slug === active);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-terracotta-500" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
          {t("mostLoved")}
        </span>
      </div>
      <h2 className="mt-3 font-serif text-3xl font-semibold text-walnut-950 sm:text-4xl">
        {t("bestSellers")}
      </h2>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
            active === "all"
              ? "bg-sage-900 text-cream-50"
              : "border border-ink-200 bg-cream-50 text-ink-700 hover:border-ink-300"
          )}
        >
          {t("all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActive(c.slug)}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              active === c.slug
                ? "bg-sage-900 text-cream-50"
                : "border border-ink-200 bg-cream-50 text-ink-700 hover:border-ink-300"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {visible.map((p) => {
          const image = getProductPreviewImage(p);
          const badge = p.isNewArrival ? t("new") : t("bestSeller");
          return (
            <Link key={p.id} href={`/product/${p.slug}`} className="group flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden">
                <ProductImage
                  src={image?.url ?? ""}
                  alt={image?.alt ?? p.name}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <span
                  className={cn(
                    "absolute start-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-50",
                    p.isNewArrival ? "bg-terracotta-600" : "bg-sage-900"
                  )}
                >
                  {badge}
                </span>
              </div>
              <div className="pt-3">
                {p.category ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    {p.category.name}
                  </p>
                ) : null}
                <h3 className="mt-1 line-clamp-1 font-serif text-base font-semibold text-walnut-950">
                  {p.name}
                </h3>
                <StarRating
                  rating={p.rating}
                  count={p.reviewCount}
                  className="mt-1"
                  filledClassName="fill-amber-600 text-amber-600"
                />
                <p className="mt-2 font-serif text-lg font-semibold text-walnut-950">
                  {formatPrice(p.basePrice, locale)}
                </p>
              </div>
            </Link>
          );
        })}
        {visible.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm text-ink-400">
            {t("noProductsCategory")}
          </p>
        ) : null}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/shop?sort=popularity"
          className="inline-flex items-center gap-2 border border-ink-900 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-cream-50"
        >
          {t("viewAllProducts")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
