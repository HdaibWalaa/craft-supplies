import Link from "next/link";
import { getCategoryTheme } from "@/lib/categories";
import { getCategoryIcon } from "@/lib/category-icons";

export function CategoryTile({
  slug,
  name,
  themeSlug,
  productCount,
}: {
  slug: string;
  name: string;
  themeSlug: string;
  productCount?: number;
}) {
  const theme = getCategoryTheme(themeSlug);
  const Icon = getCategoryIcon(themeSlug);

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden"
      style={{ background: `linear-gradient(150deg, ${theme.from}, ${theme.to})` }}
    >
      <div
        className="absolute inset-0 opacity-[0.12] transition-opacity group-hover:opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          color: "#fff",
        }}
      />
      <Icon
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-white/20 transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32"
        strokeWidth={1}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 100%)" }}
      />
      <div className="relative p-4 sm:p-5">
        <span className="block font-serif text-lg font-semibold text-white sm:text-xl">{name}</span>
        {productCount !== undefined ? (
          <span className="mt-0.5 block text-xs text-white/70">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
