"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/actions/admin/products";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/utils";

type ImageEntry = { url: string; alt: string };
type VariantEntry = {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockAt: number;
  attributes: Record<string, string>;
};
type AttrEntry = { key: string; value: string };

export type AdminProductFormProps = {
  categories: { id: string; name: string; colorTheme: string }[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    shortDescription: string;
    description: string;
    basePrice: number;
    compareAtPrice: number | null;
    images: ImageEntry[];
    attributes: Record<string, string>;
    specifications: Record<string, string>;
    safetyWarnings: string | null;
    usageNotes: string | null;
    isBundle: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
    status: string;
    variants: VariantEntry[];
  };
};

function recordToEntries(r: Record<string, string>): AttrEntry[] {
  return Object.entries(r).map(([key, value]) => ({ key, value }));
}
function entriesToRecord(entries: AttrEntry[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of entries) if (e.key.trim()) out[e.key.trim()] = e.value;
  return out;
}

export function AdminProductForm({ categories, initial }: AdminProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(String(initial?.compareAtPrice ?? ""));
  const [safetyWarnings, setSafetyWarnings] = useState(initial?.safetyWarnings ?? "");
  const [usageNotes, setUsageNotes] = useState(initial?.usageNotes ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? false);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [images, setImages] = useState<ImageEntry[]>(initial?.images ?? []);
  const [attributes, setAttributes] = useState<AttrEntry[]>(recordToEntries(initial?.attributes ?? {}));
  const [specifications, setSpecifications] = useState<AttrEntry[]>(recordToEntries(initial?.specifications ?? {}));
  const [variants, setVariants] = useState<VariantEntry[]>(
    initial?.variants ?? [{ name: "", sku: "", price: 0, stock: 0, lowStockAt: 5, attributes: {} }]
  );

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.url) {
      setImages((imgs) => [...imgs, { url: json.url, alt: name || "Product image" }]);
    } else {
      setError(json.error ?? "Upload failed.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: ProductInput = {
      id: initial?.id,
      name,
      slug,
      categoryId,
      shortDescription,
      description,
      basePrice: Number(basePrice) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images,
      attributes: entriesToRecord(attributes),
      specifications: entriesToRecord(specifications),
      safetyWarnings,
      usageNotes,
      isBundle: initial?.isBundle ?? false,
      bundleItemIds: [],
      isFeatured,
      isNewArrival,
      status: status as "active" | "draft" | "archived",
      variants: variants.map((v) => ({ ...v, price: Number(v.price) || 0, stock: Number(v.stock) || 0, lowStockAt: Number(v.lowStockAt) || 5 })),
    };

    startTransition(async () => {
      const res = await saveProduct(input);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-20">
      <section className="grid gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug (optional — auto-generated from name)</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={name ? name.toLowerCase().replace(/\s+/g, "-") : ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Full Description</Label>
          <Textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="basePrice">Base Price ($)</Label>
          <Input id="basePrice" type="number" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compareAtPrice">Compare-At Price ($, optional)</Label>
          <Input id="compareAtPrice" type="number" min={0} step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="safetyWarnings">Safety Warnings (optional)</Label>
          <Textarea id="safetyWarnings" rows={2} value={safetyWarnings} onChange={(e) => setSafetyWarnings(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usageNotes">Usage Notes (optional)</Label>
          <Textarea id="usageNotes" rows={2} value={usageNotes} onChange={(e) => setUsageNotes(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-terracotta-600" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-terracotta-600" />
            New Arrival
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
        <h2 className="font-display text-lg font-semibold text-ink-900">Images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <ProductImage src={img.url} alt={img.alt} className="h-24 w-24 rounded-lg" />
              <button
                type="button"
                onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-red-600 p-1 text-white"
                aria-label="Remove image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-300 text-ink-400 hover:border-terracotta-400 hover:text-terracotta-600"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-xs">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
        <p className="mt-2 text-xs text-ink-400">
          No images uploaded yet? A themed placeholder tile is shown automatically on the storefront.
        </p>
      </section>

      <KeyValueEditor title="Attributes" hint="e.g. waxType, scentFamily, woodType" entries={attributes} setEntries={setAttributes} />
      <KeyValueEditor title="Specifications" hint="e.g. material, weight, dimensions" entries={specifications} setEntries={setSpecifications} />

      <section className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Variants</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setVariants((v) => [...v, { name: "", sku: "", price: 0, stock: 0, lowStockAt: 5, attributes: {} }])}
          >
            <Plus className="h-4 w-4" /> Add Variant
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-ink-200 p-3 sm:grid-cols-5">
              <Input
                placeholder="Name (e.g. 8oz)"
                value={v.name}
                onChange={(e) => setVariants((vs) => vs.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                required
              />
              <Input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => setVariants((vs) => vs.map((x, idx) => (idx === i ? { ...x, sku: e.target.value } : x)))}
                required
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                value={v.price}
                onChange={(e) => setVariants((vs) => vs.map((x, idx) => (idx === i ? { ...x, price: Number(e.target.value) } : x)))}
                required
              />
              <Input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => setVariants((vs) => vs.map((x, idx) => (idx === i ? { ...x, stock: Number(e.target.value) } : x)))}
                required
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Low stock at"
                  value={v.lowStockAt}
                  onChange={(e) => setVariants((vs) => vs.map((x, idx) => (idx === i ? { ...x, lowStockAt: Number(e.target.value) } : x)))}
                />
                <button
                  type="button"
                  disabled={variants.length <= 1}
                  onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                  className={cn("cursor-pointer rounded-md p-2 text-ink-400 hover:bg-red-50 hover:text-red-600", variants.length <= 1 && "opacity-30")}
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-200 bg-cream-50 px-6 py-4 sm:left-64">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : initial ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function KeyValueEditor({
  title,
  hint,
  entries,
  setEntries,
}: {
  title: string;
  hint: string;
  entries: AttrEntry[];
  setEntries: React.Dispatch<React.SetStateAction<AttrEntry[]>>;
}) {
  return (
    <section className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          <p className="text-xs text-ink-400">{hint}</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setEntries((e) => [...e, { key: "", value: "" }])}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Key"
              value={entry.key}
              onChange={(e) => setEntries((es) => es.map((x, idx) => (idx === i ? { ...x, key: e.target.value } : x)))}
              className="max-w-48"
            />
            <Input
              placeholder="Value"
              value={entry.value}
              onChange={(e) => setEntries((es) => es.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
            />
            <button
              type="button"
              onClick={() => setEntries((es) => es.filter((_, idx) => idx !== i))}
              className="cursor-pointer rounded-md p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
