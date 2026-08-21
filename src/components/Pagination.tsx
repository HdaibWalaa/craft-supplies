import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100",
          page === 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 ? <span className="px-1 text-ink-400">&hellip;</span> : null}
          <Link
            href={buildHref(p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
              p === page ? "bg-primary text-primary-foreground" : "text-ink-700 hover:bg-muted-soft"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100",
          page === pageCount && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
