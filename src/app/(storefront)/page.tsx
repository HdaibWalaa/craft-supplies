import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Truck,
  Sparkles as SparklesIcon,
  Leaf,
  Flame,
  Package,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  getCategories,
  getBestSellers,
  getNewArrivals,
  getBundles,
  getBundleComponents,
  getHeroProduct,
  parseImages,
} from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { CategoryTile } from "@/components/CategoryTile";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductRail } from "@/components/ProductRail";
import { BestSellersSection } from "@/components/BestSellersSection";
import { GiftKitCard } from "@/components/GiftKitCard";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

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
  ] = await Promise.all([
    getCategories(),
    getBestSellers(6),
    getNewArrivals(8),
    getBundles(3),
    prisma.review.findMany({
      where: { approved: true, rating: { gte: 5 }, comment: { not: "" } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getHeroProduct(),
  ]);

  const bundleIncludes = await Promise.all(
    bundles.map(async (b) => (await getBundleComponents(b.bundleItemIds)).map((c) => c.name))
  );

  const heroImage = heroProduct
    ? parseImages(heroProduct.images)[0]
    : undefined;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-stretch md:min-h-[38rem] lg:min-h-[42rem] lg:gap-16 lg:px-8">
          <div className="flex flex-col justify-center py-10 md:py-12">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
                New Collection &mdash; Fall 2026
              </span>
            </div>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] text-walnut-950 sm:text-5xl lg:text-6xl">
              Everything you need
              <br />
              <span className="italic text-sage-700">to make it yourself.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-600 sm:text-lg">
              Candle wax, resin, soap bases, molds, fragrance oils, concrete
              mixes, and wood blanks — sourced and tested for makers who like
              doing things by hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-sage-900 px-6 py-3.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-800"
              >
                Shop All Supplies <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-ink-900 px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-cream-50"
              >
                Get Project Ideas
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
                <Leaf className="h-4 w-4 text-sage-600" /> Ethically Sourced
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
                <Flame className="h-4 w-4 text-terracotta-600" /> Maker-Tested
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-600">
                <Package className="h-4 w-4 text-sage-600" /> Plastic-Free
                Packaging
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
              <div className="absolute bottom-4 left-4 max-w-[13rem] rounded-xl bg-cream-50 p-4 shadow-[var(--shadow-card-hover)] sm:bottom-6 sm:left-6">
                <p className="text-xs text-ink-400">Best Seller</p>
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

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Category grid */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
                Browse
              </span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-walnut-950 sm:text-4xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-900 underline underline-offset-4 hover:text-terracotta-700"
          >
            All products <ChevronRight className="h-4 w-4" />
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
            title="Kits & Bundles"
            subtitle="Everything you need for a project, bundled at a discount."
            href="/category/kits-bundles"
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
          title="New Arrivals"
          subtitle="Fresh in the shop this month."
          href="/shop?sort=newest"
        />
        <ProductRail products={newArrivals} />
      </div>

      {/* Trust signals */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl bg-sage-50 p-8 sm:p-10 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">Secure Checkout</h3>
              <p className="mt-1 text-sm text-ink-600">
                Payments are processed securely — we never store your card
                details.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">Careful Shipping</h3>
              <p className="mt-1 text-sm text-ink-600">
                Fragile items like resin and glass are packed with extra care.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <SparklesIcon className="h-6 w-6 shrink-0 text-sage-700" />
            <div>
              <h3 className="font-semibold text-ink-900">Maker-Tested</h3>
              <p className="mt-1 text-sm text-ink-600">
                Every supply is tested in-house before it ever hits the shelf.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionHeading title="What Makers Are Saying" />
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
        <div className="rounded-3xl bg-terracotta-600 px-6 py-10 text-center sm:px-12">
          <h2 className="font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-terracotta-100">
            Join our list for project ideas, new arrivals, and maker tips — no
            spam, unsubscribe anytime.
          </p>
          <div className="mt-5 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
