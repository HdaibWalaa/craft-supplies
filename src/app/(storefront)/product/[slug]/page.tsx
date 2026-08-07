import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldAlert, Info } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
  getBundleComponents,
  parseImages,
  parseJsonObject,
} from "@/lib/data";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantPurchasePanel } from "@/components/VariantPurchasePanel";
import { WishlistButton } from "@/components/WishlistButton";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import { ProductGrid } from "@/components/ProductRail";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [session, related, bundleComponents] = await Promise.all([
    auth(),
    getRelatedProducts(product.categoryId, product.id, 4),
    getBundleComponents(product.bundleItemIds),
  ]);

  let wishlisted = false;
  if (session?.user) {
    const w = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    });
    wishlisted = !!w;
  }

  const images = parseImages(product.images);
  const attributes = parseJsonObject(product.attributes);
  const specifications = parseJsonObject(product.specifications);
  const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: images.map((i) => i.url).filter((u) => !u.startsWith("placeholder:")),
    sku: product.variants[0]?.sku,
    aggregateRating:
      product.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
        : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...product.variants.map((v) => v.price)),
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8 md:pb-10">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-500">
        <Link href="/shop" className="hover:text-terracotta-700">Shop</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-terracotta-700">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} />

        <div>
          {product.isBundle ? <Badge variant="terracotta" className="mb-2">Kit / Bundle</Badge> : null}
          <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>
          <p className="mt-4 text-ink-600">{product.shortDescription}</p>

          <div className="mt-6">
            <VariantPurchasePanel
              productName={product.name}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                stock: v.stock,
                attributes: parseJsonObject(v.attributes),
              }))}
            />
          </div>

          <div className="mt-4">
            <WishlistButton productId={product.id} productSlug={product.slug} initialWishlisted={wishlisted} />
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-cream-100 p-3.5 text-sm text-ink-600">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
            Ships in 1-2 business days. Estimated delivery in 3-7 business days.
          </div>

          {product.safetyWarnings ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-terracotta-50 p-3.5 text-sm text-terracotta-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {product.safetyWarnings}
            </div>
          ) : null}

          {product.isBundle && bundleComponents.length > 0 ? (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">This kit includes:</h2>
              <ul className="flex flex-col gap-2">
                {bundleComponents.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/product/${c.slug}`}
                      className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 text-sm hover:border-terracotta-400"
                    >
                      <span className="text-ink-800">{c.name}</span>
                      <span className="text-ink-500">{formatPrice(c.basePrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-14">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <p className="max-w-3xl whitespace-pre-line text-ink-700">{product.description}</p>
            {product.usageNotes ? (
              <div className="mt-4 flex items-start gap-2 text-sm text-ink-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{product.usageNotes}</span>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="specs">
            <dl className="grid max-w-xl grid-cols-2 gap-x-6 gap-y-3">
              {Object.entries({ ...specifications, ...attributes }).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-sm capitalize text-ink-500">{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd className="text-sm font-medium text-ink-800">{value}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold text-ink-900">
                    {product.rating.toFixed(1)}
                  </span>
                  <StarRating rating={product.rating} size="md" />
                </div>
                <p className="mt-1 text-sm text-ink-500">Based on {product.reviewCount} reviews</p>
                <div className="mt-4 flex flex-col gap-1.5">
                  {starBreakdown.map((b) => (
                    <div key={b.star} className="flex items-center gap-2 text-xs text-ink-500">
                      <span className="w-8">{b.star} star</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full bg-terracotta-500"
                          style={{
                            width: `${product.reviewCount ? (b.count / product.reviewCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right">{b.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <ReviewForm productId={product.id} productSlug={product.slug} />
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-2">
                {product.reviews.length === 0 ? (
                  <p className="text-sm text-ink-500">Be the first to review this product.</p>
                ) : (
                  product.reviews.map((r) => (
                    <div key={r.id} className="border-b border-ink-200 pb-6 last:border-none">
                      <div className="flex items-center justify-between">
                        <StarRating rating={r.rating} />
                        <span className="text-xs text-ink-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {r.title ? <p className="mt-2 font-medium text-ink-900">{r.title}</p> : null}
                      <p className="mt-1 text-sm text-ink-600">{r.comment}</p>
                      <p className="mt-2 text-xs font-medium text-ink-500">{r.authorName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">
            Frequently Bought Together
          </h2>
          <ProductGrid products={related} />
        </div>
      ) : null}
    </div>
  );
}
