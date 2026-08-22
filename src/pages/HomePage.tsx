import Link from "@/routing/Link";
import type { Metadata } from "@/types/metadata";
import {
  ShieldCheck,
  Truck,
  Sparkles as SparklesIcon,
  ChevronRight,
} from "lucide-react";
import {
  getCategories,
  getBestSellers,
  getNewArrivals,
  getBundles,
  getBundleComponents,
  getHeroProduct,
  getHomepageSettings,
} from "@/lib/data";
import { fetchTestimonials } from "@/lib/api/testimonials";
import { CategoryTile } from "@/components/CategoryTile";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductRail } from "@/components/ProductRail";
import { BestSellersSection } from "@/components/BestSellersSection";
import { GiftKitCard } from "@/components/GiftKitCard";
import { StarRating } from "@/components/StarRating";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { getTranslations } from "@/lib/i18n/server";
import { HeroRenderer } from "@/components/home/heroes/HeroRenderer";

export const metadata: Metadata = {
  title: "Handmade & Home-Based Craft Supplies",
  description:
    "Shop candle-making, resin, soap-making, molds, fragrances, concrete, and wooden craft supplies. Warm, well-tested materials for makers of every level.",
};

export default async function HomePage() {
  const [
    categories,
    bestSellers,
    newArrivals,
    bundles,
    testimonials,
    heroProduct,
    homepageSettings,
    translations,
  ] = await Promise.all([
    getCategories(),
    getBestSellers(6),
    getNewArrivals(8),
    getBundles(3),
    fetchTestimonials(),
    getHeroProduct(),
    getHomepageSettings(),
    getTranslations(),
  ]);
  const { t } = translations;

  const bundleIncludes = await Promise.all(
    bundles.map(async (b) => (await getBundleComponents(b.bundleItemIds)).map((c) => c.name))
  );

  return (
    <div>
      {/* Hero */}
      <HeroRenderer
        style={homepageSettings.hero_style}
        heroTwo={homepageSettings.hero_2}
        heroProduct={heroProduct}
        t={t}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Category grid */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
                {t("browse")}
              </span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-walnut-950 sm:text-4xl">
              {t("shopByCategory")}
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-900 underline underline-offset-4 hover:text-terracotta-700"
          >
            {t("allProducts")} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <CategoryTile
              key={c.slug}
              slug={c.slug}
              name={c.name}
              themeSlug={c.colorTheme}
              productCount={c._count.products}
              productCountLabel={t("productsCount", { count: c._count.products })}
              imageUrl={c.image?.url}
            />
          ))}
        </div>
      </div>

      {/* Best sellers */}

      <BestSellersSection products={bestSellers} />

      {/* Kits & bundles */}
      {bundles.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            title={t("kitsBundles")}
            subtitle={t("kitsDescription")}
            href="/shop?bundle=true"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b, i) => (
              <GiftKitCard key={b.id} product={b} includes={bundleIncludes[i] ?? []} />
            ))}
          </div>
        </div>
      ) : null}

      {/* New arrivals */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t("newArrivals")}
          subtitle={t("newArrivalsDescription")}
          href="/shop?new=true"
        />
        <ProductRail products={newArrivals} />
      </div>

      {/* Trust signals */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl bg-sage-50 p-8 sm:p-10 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">{t("checkoutSecurityTitle")}</h3>
              <p className="mt-1 text-sm text-ink-600">
                {t("checkoutSecurityDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">{t("shippingCareTitle")}</h3>
              <p className="mt-1 text-sm text-ink-600">
                {t("shippingCareDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <SparklesIcon className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">{t("makerTested")}</h3>
              <p className="mt-1 text-sm text-ink-600">
                {t("makerTestedDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionHeading title={t("makerReviews")} />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-ink-200/70 bg-cream-50 p-6 shadow-[var(--shadow-card)]"
              >
                <StarRating rating={t.rating} size="md" />
                <p className="mt-3 text-sm text-ink-700">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium text-ink-900">
                  {t.authorName}{" "}
                  <span className="font-normal text-ink-400">
                    &middot; {t.product.name}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-sage-700 px-6 py-10 text-center sm:px-12">
          <h2 className="font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            {t("newsletterOffer")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-sage-100">
            {t("newsletterDescription")}
          </p>
          <div className="mt-5 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
