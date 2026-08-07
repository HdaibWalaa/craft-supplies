import Image from "next/image";
import { getCategoryTheme } from "@/lib/categories";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  iconClassName?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders either a real uploaded/remote image (next/image) or, for the
 * "placeholder:<categorySlug>:<seed>" convention used by seeded/demo
 * products, a generated gradient tile in the category's theme color.
 * Real product photography is business-owner-supplied content — see
 * README — so seeded data intentionally never hotlinks stock photos.
 */
export function ProductImage({
  src,
  alt,
  className,
  iconClassName,
  sizes,
  priority,
}: ProductImageProps) {
  if (!src || src.startsWith("placeholder:")) {
    const [, theme, seed = ""] = (src || "placeholder:candle-making").split(":");
    const def = getCategoryTheme(theme);
    const Icon = CATEGORY_ICONS[def.icon];
    const hash = hashSeed(seed || def.slug);
    const rotate = (hash % 20) - 10;
    const scale = 1 + ((hash >> 4) % 10) / 100;

    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${def.from}, ${def.to})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
            color: "#fff",
          }}
        />
        <Icon
          className={cn(
            "relative text-white/90 drop-shadow-sm",
            iconClassName ?? "h-1/3 w-1/3"
          )}
          strokeWidth={1.5}
          style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
