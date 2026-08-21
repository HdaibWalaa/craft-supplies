import { useMemo, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Zap, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export type VariantOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
};

export function VariantPurchasePanel({
  productName,
  variants,
  attributeLabels = {},
}: {
  productName: string;
  variants: VariantOption[];
  attributeLabels?: Record<string, string>;
}) {
  const attributeKeys = useMemo(() => {
    const keys: string[] = [];
    for (const v of variants) {
      for (const k of Object.keys(v.attributes)) {
        if (!keys.includes(k)) keys.push(k);
      }
    }
    return keys;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const k of attributeKeys) {
      initial[k] = variants[0]?.attributes[k] ?? "";
    }
    return initial;
  });
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { locale, t } = useI18n();

  const matchedVariant = attributeKeys.length > 0
    ? variants.find((v) => attributeKeys.every((k) => v.attributes[k] === selected[k])) ?? variants[0]
    : variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  const valuesForKey = (key: string) => {
    const seen: string[] = [];
    for (const v of variants) {
      const val = v.attributes[key];
      if (val && !seen.includes(val)) seen.push(val);
    }
    return seen;
  };

  function isValueAvailable(key: string, value: string) {
    return variants.some(
      (v) =>
        v.attributes[key] === value &&
        v.stock > 0 &&
        attributeKeys
          .filter((k) => k !== key)
          .every((k) => v.attributes[k] === selected[k])
    );
  }

  function handlePurchase(buyNow: boolean) {
    if (!matchedVariant) return;
    setMessage(null);
    startTransition(async () => {
      const res = await addToCart(matchedVariant.id, qty);
      if (res.error) {
        setMessage(res.error);
        return;
      }
      if (buyNow) {
        navigate("/checkout");
      } else {
        setMessage(t("addedToCart"));
        window.dispatchEvent(new Event("storefront:refresh"));
      }
    });
  }

  const outOfStock = !matchedVariant || matchedVariant.stock <= 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold text-ink-900">
          {formatPrice(matchedVariant?.price ?? variants[0]?.price ?? 0, locale)}
        </span>
      </div>

      {attributeKeys.map((key) => (
        <div key={key}>
          <p className="mb-2 text-sm font-medium text-ink-800">{attributeLabels[key] ?? key}</p>
          <div className="flex flex-wrap gap-2">
            {valuesForKey(key).map((value) => {
              const isSelected = selected[key] === value;
              const available = isValueAvailable(key, value);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-muted-soft text-primary"
                      : "border-border text-ink-700 hover:border-sage-500 hover:bg-sage-50",
                    !available && "cursor-not-allowed opacity-40 line-through"
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {attributeKeys.length === 0 && variants.length > 1 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-800">{t("option")}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={variant.stock <= 0}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selectedVariantId === variant.id
                    ? "border-primary bg-muted-soft text-primary"
                    : "border-border text-ink-700 hover:border-sage-500 hover:bg-sage-50",
                  variant.stock <= 0 && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-1 text-sm font-medium text-ink-800">
          {outOfStock ? (
            <span className="text-red-600">{t("outOfStock")}</span>
          ) : matchedVariant.stock <= (5 as number) ? (
            <span className="text-terracotta-700">{t("onlyLeft", { count: matchedVariant.stock })}</span>
          ) : (
            <span className="text-sage-700">{t("inStock")}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-ink-300">
          <button
            type="button"
            aria-label={t("decreaseQuantity")}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="cursor-pointer p-2.5 text-ink-600 hover:text-terracotta-700"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            aria-label={t("increaseQuantity")}
            onClick={() => setQty((q) => Math.min(matchedVariant?.stock ?? 1, q + 1))}
            className="cursor-pointer p-2.5 text-ink-600 hover:text-terracotta-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={outOfStock || pending}
          onClick={() => handlePurchase(false)}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          {t("addToCart")}
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          disabled={outOfStock || pending}
          onClick={() => handlePurchase(true)}
        >
          <Zap className="h-4 w-4" />
          {t("buyNow")}
        </Button>
      </div>
      {message ? <p className="text-sm text-ink-600">{message}</p> : null}

      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink-200 bg-cream-50 p-3 shadow-[0_-4px_12px_rgba(26,22,19,0.08)] md:hidden">
        <div className="flex-1">
          <p className="truncate text-xs text-ink-500">{productName}</p>
          <p className="font-semibold text-ink-900">{formatPrice(matchedVariant?.price ?? 0, locale)}</p>
        </div>
        <Button size="md" disabled={outOfStock || pending} onClick={() => handlePurchase(false)}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("addToCart")}
        </Button>
      </div>
    </div>
  );
}
