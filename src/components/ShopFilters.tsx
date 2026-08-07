"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CategoryOption = { slug: string; name: string };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popularity", label: "Most Popular" },
];

export function ShopFilters({
  categories,
  showCategoryFilter = true,
}: {
  categories?: CategoryOption[];
  showCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function submitForm() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() !== "") params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const view = searchParams.get("view") ?? "grid";

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-3xl border border-ink-200/70 bg-cream-50 p-4"
    >
      <SlidersHorizontal className="mb-2.5 hidden h-4 w-4 text-ink-400 sm:block" />

      {showCategoryFilter && categories ? (
        <div className="flex min-w-40 flex-col gap-1">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            defaultValue={searchParams.get("category") ?? "all"}
            onValueChange={submitForm}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <Label htmlFor="min">Min Price</Label>
        <Input
          id="min"
          name="min"
          type="number"
          min={0}
          step="1"
          defaultValue={searchParams.get("min") ?? ""}
          placeholder="$0"
          className="w-24"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="max">Max Price</Label>
        <Input
          id="max"
          name="max"
          type="number"
          min={0}
          step="1"
          defaultValue={searchParams.get("max") ?? ""}
          placeholder="$200"
          className="w-24"
        />
      </div>

      <label className="mb-2.5 flex cursor-pointer items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          name="stock"
          value="true"
          defaultChecked={searchParams.get("stock") === "true"}
          onChange={submitForm}
          className="h-4 w-4 rounded border-ink-300 text-terracotta-600 focus-visible:ring-terracotta-500"
        />
        In stock only
      </label>

      <div className="flex flex-col gap-1">
        <Label htmlFor="sort">Sort by</Label>
        <Select name="sort" defaultValue={searchParams.get("sort") ?? "newest"} onValueChange={submitForm}>
          <SelectTrigger id="sort" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <input type="hidden" name="view" value={view} />

      <div className="ml-auto flex items-center gap-2">
        <div className="flex rounded-lg border border-ink-300 p-0.5">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "grid");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className={cn("rounded-md p-1.5 cursor-pointer", view === "grid" ? "bg-terracotta-100 text-terracotta-700" : "text-ink-500")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "list");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className={cn("rounded-md p-1.5 cursor-pointer", view === "list" ? "bg-terracotta-100 text-terracotta-700" : "text-ink-500")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Button type="submit" size="sm" variant="outline">
          Apply
        </Button>
      </div>
    </form>
  );
}
