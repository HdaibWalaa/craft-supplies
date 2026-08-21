import { useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

type CategoryOption = { slug: string; name: string };

export function ShopFilters({
  categories,
  showCategoryFilter = true,
}: {
  categories?: CategoryOption[];
  showCategoryFilter?: boolean;
}) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const { locale, t } = useI18n();
  const sortOptions = [
    { value: "newest", label: t("newest") },
    { value: "price-asc", label: t("priceLowHigh") },
    { value: "price-desc", label: t("priceHighLow") },
    { value: "rating", label: t("topRated") },
    { value: "popularity", label: t("mostPopular") },
  ];

  function submitForm() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() !== "") params.set(key, value);
    }
    params.delete("page");
    navigate(`${pathname}?${params.toString()}`, { preventScrollReset: true });
  }

  const view = searchParams.get("view") ?? "grid";

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-3xl border border-border/80 bg-muted-soft/60 p-4"
    >
      <SlidersHorizontal className="mb-2.5 hidden h-4 w-4 text-ink-400 sm:block" />

      {showCategoryFilter && categories ? (
        <div className="flex min-w-40 flex-col gap-1">
          <Label htmlFor="category">{t("category")}</Label>
          <Select
            name="category"
            defaultValue={searchParams.get("category") ?? "all"}
            onValueChange={submitForm}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
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
        <Label htmlFor="min">{t("minPrice")}</Label>
        <Input
          id="min"
          name="min"
          type="number"
          min={0}
          step="1"
          defaultValue={searchParams.get("min") ?? ""}
          placeholder={locale === "ar" ? "0 دينار" : "JOD 0"}
          className="w-24"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="max">{t("maxPrice")}</Label>
        <Input
          id="max"
          name="max"
          type="number"
          min={0}
          step="1"
          defaultValue={searchParams.get("max") ?? ""}
          placeholder={locale === "ar" ? "200 دينار" : "JOD 200"}
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
          className="h-4 w-4 rounded border-border text-primary focus-visible:ring-ring"
        />
        {t("inStockOnly")}
      </label>

      <div className="flex flex-col gap-1">
        <Label htmlFor="sort">{t("sortBy")}</Label>
        <Select name="sort" defaultValue={searchParams.get("sort") ?? "newest"} onValueChange={submitForm}>
          <SelectTrigger id="sort" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <input type="hidden" name="view" value={view} />

      <div className="ms-auto flex items-center gap-2">
        <div className="flex rounded-lg border border-ink-300 p-0.5">
          <button
            type="button"
            aria-label={t("gridView")}
            aria-pressed={view === "grid"}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "grid");
              navigate(`${pathname}?${params.toString()}`, { preventScrollReset: true });
            }}
            className={cn("rounded-md p-1.5 cursor-pointer", view === "grid" ? "bg-muted text-primary" : "text-ink-500")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("listView")}
            aria-pressed={view === "list"}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "list");
              navigate(`${pathname}?${params.toString()}`, { preventScrollReset: true });
            }}
            className={cn("rounded-md p-1.5 cursor-pointer", view === "list" ? "bg-muted text-primary" : "text-ink-500")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Button type="submit" size="sm" variant="outline">
          {t("apply")}
        </Button>
      </div>
    </form>
  );
}
