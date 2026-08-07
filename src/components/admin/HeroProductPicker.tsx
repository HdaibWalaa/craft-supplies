"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { setHeroProduct } from "@/app/actions/admin/settings";
import { ProductImage } from "@/components/ProductImage";
import { parseImages } from "@/lib/parse";
import { cn } from "@/lib/utils";

export type HeroProductOption = {
  id: string;
  name: string;
  images: string;
  rating: number;
  reviewCount: number;
};

export function HeroProductPicker({
  products,
  currentId,
}: {
  products: HeroProductOption[];
  currentId: string | null;
}) {
  const [selected, setSelected] = useState(currentId);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => {
        const image = parseImages(p.images)[0];
        const active = selected === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setSelected(p.id);
                await setHeroProduct(p.id);
                router.refresh();
              })
            }
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-colors disabled:opacity-60",
              active ? "border-terracotta-600 ring-2 ring-terracotta-600/30" : "border-ink-200 hover:border-ink-300"
            )}
          >
            <ProductImage
              src={image?.url ?? ""}
              alt={image?.alt ?? p.name}
              className="aspect-square w-full"
              sizes="200px"
            />
            {active ? (
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta-600 text-cream-50">
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </span>
            ) : null}
            <div className="p-2.5">
              <p className="line-clamp-1 text-sm font-medium text-ink-900">{p.name}</p>
              <p className="text-xs text-ink-500">
                {p.rating.toFixed(1)} &middot; {p.reviewCount} reviews
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
