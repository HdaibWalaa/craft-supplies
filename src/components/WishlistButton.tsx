import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function WishlistButton({
  productId,
  productSlug,
  initialWishlisted,
}: {
  productId: string;
  productSlug: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const { t } = useI18n();

  function handleClick() {
    startTransition(async () => {
      const res = await toggleWishlist(productId, productSlug);
      if (typeof res.wishlisted === "boolean") {
        setWishlisted(res.wishlisted);
      } else if (res.error) {
        setNotice(res.error);
        setTimeout(() => setNotice(null), 2500);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-300 px-4 py-2.5 text-sm font-medium text-ink-700 hover:border-terracotta-400"
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-terracotta-600 text-terracotta-600")} />
        {wishlisted ? t("savedToWishlist") : t("saveToWishlist")}
      </button>
      {notice ? (
        <p className="absolute top-full mt-1 w-48 text-xs text-terracotta-700">{notice}</p>
      ) : null}
    </div>
  );
}
