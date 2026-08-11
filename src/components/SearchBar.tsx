"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

type IndexEntry = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  image: string;
  categoryName: string;
  categorySlug: string;
};

let cachedIndex: IndexEntry[] | null = null;
let cachedIndexLocale: string | null = null;

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const fuseRef = useRef<Fuse<IndexEntry> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadIndex() {
      if (!cachedIndex || cachedIndexLocale !== locale) {
        const res = await fetch(`/api/search-index?locale=${locale}`, { cache: "no-store" });
        cachedIndex = await res.json();
        cachedIndexLocale = locale;
      }
      fuseRef.current = new Fuse(cachedIndex ?? [], {
        keys: ["name", "shortDescription", "categoryName"],
        threshold: 0.35,
        ignoreLocation: true,
      });
    }
    loadIndex();
  }, [locale]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (!fuseRef.current || value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const matches = fuseRef.current.search(value).slice(0, 6).map((r) => r.item);
    setResults(matches);
    setOpen(true);
  }

  function goToResults() {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goToResults()}
          className="h-11 w-full rounded-full border border-ink-300 bg-cream-50 ps-10 pe-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500"
          aria-label={t("searchProducts")}
        />
        {query ? (
          <button
            type="button"
            onClick={() => handleChange("")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
            aria-label={t("clearSearch")}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-ink-200 bg-cream-50 shadow-[var(--shadow-card-hover)]">
          <ul>
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/product/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-terracotta-50"
                >
                  <ProductImage
                    src={r.image}
                    alt={r.name}
                    className="h-10 w-10 shrink-0 rounded-md"
                    iconClassName="h-1/2 w-1/2"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{r.name}</p>
                    <p className="truncate text-xs text-ink-500">{r.categoryName}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-terracotta-700">
                    {formatPrice(r.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={goToResults}
            className="block w-full border-t border-ink-200 px-3 py-2.5 text-center text-sm font-medium text-terracotta-700 hover:bg-terracotta-50 cursor-pointer"
          >
            {t("searchAllResults", { query })}
          </button>
        </div>
      ) : null}
    </div>
  );
}
