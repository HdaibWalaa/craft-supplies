import type { Metadata } from "@/types/metadata";
import Link from "@/routing/Link";
import { getBlogPosts } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "Tutorials & Inspiration",
  description: "Project ideas and how-tos for candle-making, resin, soap, and more.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
        Tutorials &amp; Inspiration
      </h1>
      <p className="mt-2 max-w-xl text-ink-500">
        Project ideas, techniques, and tips from our workshop to yours.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <ProductImage
              src={`placeholder:${post.coverImageTheme}:${post.slug}`}
              alt={post.title}
              className="aspect-[16/10] w-full rounded-3xl"
              iconClassName="h-1/5 w-1/5"
            />
            <h2 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-terracotta-700">
              {post.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-ink-500">{post.excerpt}</p>
            <p className="mt-2 text-xs text-ink-400">
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
