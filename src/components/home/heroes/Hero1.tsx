import Link from "@/routing/Link";
import { ArrowRight, Flame, Leaf, Package } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { parseImages } from "@/lib/data";
import type { HeroProps } from "./types";

export function Hero1({ heroProduct, t }: HeroProps) {
  const heroImage = heroProduct
    ? parseImages(heroProduct.images)[0]
    : undefined;

  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div className="relative mx-auto grid w-full max-w-7xl min-w-0 gap-10 px-4 sm:px-6 md:min-h-[38rem] md:grid-cols-2 md:items-stretch lg:min-h-[42rem] lg:gap-16 lg:px-8">
        <div className="flex min-w-0 flex-col justify-center py-10 md:py-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-terracotta-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
              {t("newCollection")}
            </span>
          </div>
          <h1 className="mt-5 max-w-full break-words font-serif text-3xl font-semibold leading-[1.1] text-walnut-950 sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-600 sm:text-lg">
            {t("heroDescription")}
          </p>
          <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="inline-flex w-full min-w-0 items-center justify-center gap-2 bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto sm:px-6"
            >
              {t("shopAllSupplies")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex w-full min-w-0 items-center justify-center gap-2 border border-ink-900 px-4 py-3.5 text-center text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-cream-50 sm:w-auto sm:px-6"
            >
              {t("projectIdeas")}
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
              <Leaf className="h-4 w-4 text-sage-600" /> {t("ethicallySourced")}
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
              <Flame className="h-4 w-4 text-terracotta-600" /> {t("makerTested")}
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
              <Package className="h-4 w-4 text-sage-600" /> {t("plasticFree")}
            </span>
          </div>
        </div>

        <div className="relative min-h-[26rem] overflow-hidden shadow-[var(--shadow-card-hover)] sm:min-h-[30rem] md:min-h-0">
          <ProductImage
            src={heroImage?.url ?? "placeholder:candle-making"}
            alt={
              heroImage?.alt ?? heroProduct?.name ?? "Featured craft supplies"
            }
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {heroProduct ? (
            <div className="absolute bottom-4 start-4 max-w-[13rem] rounded-xl bg-cream-50 p-4 shadow-[var(--shadow-card-hover)] sm:bottom-6 sm:start-6">
              <p className="text-xs text-ink-400">{t("bestSeller")}</p>
              <p className="mt-1 line-clamp-1 font-serif text-base font-semibold text-walnut-950">
                {heroProduct.name}
              </p>
              <StarRating
                rating={heroProduct.rating}
                count={heroProduct.reviewCount}
                className="mt-1.5"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
