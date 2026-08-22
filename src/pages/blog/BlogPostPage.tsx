import { Navigate } from "react-router-dom";
import Link from "@/routing/Link";
import { getBlogPostBySlug } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { ProductGrid } from "@/components/ProductRail";
import { PageMetadata } from "@/components/PageMetadata";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return <Navigate to="/404" replace />;

  const relatedProducts = post.relatedProducts.map((rp) => rp.product);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageMetadata title={post.metaTitle || post.title} description={post.metaDescription || post.excerpt} />
      <TutorialsBackLink />
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-ink-400">
        {new Date(post.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <ProductImage
        src={`placeholder:${post.coverImageTheme}:${post.slug}`}
        alt={post.title}
        className="mt-6 aspect-[16/9] w-full rounded-3xl"
        iconClassName="h-1/4 w-1/4"
      />

      <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-ink-700">
        {post.content}
      </div>

      {relatedProducts.length > 0 ? (
        <div className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">Supplies Used</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      ) : null}
    </article>
  );
}

function TutorialsBackLink() {
  const { locale, t } = useI18n();

  return (
    <Link href="/blog" className="text-sm text-terracotta-700 hover:underline">
      {locale === "ar" ? "→" : "←"} {t("tutorialsInspiration")}
    </Link>
  );
}
