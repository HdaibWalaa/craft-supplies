import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function ProductGallery({
  images,
  initialImage,
}: {
  images: { url: string; alt: string }[];
  initialImage?: { url: string; alt: string };
}) {
  const [active, setActive] = useState<number | null>(null);
  const { t } = useI18n();
  const current = active === null ? (initialImage ?? images[0]) : (images[active] ?? initialImage ?? images[0]);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl">
        <ProductImage
          src={current?.url ?? ""}
          alt={current?.alt ?? ""}
          className="aspect-square w-full transition-transform duration-300 hover:scale-105"
          iconClassName="h-1/4 w-1/4"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={t("viewImage", { count: i + 1 })}
              aria-current={i === active}
              className={cn(
                "h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 ring-transparent",
                i === active && "ring-primary"
              )}
            >
              <ProductImage src={img.url} alt={img.alt} className="h-full w-full" iconClassName="h-1/2 w-1/2" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
