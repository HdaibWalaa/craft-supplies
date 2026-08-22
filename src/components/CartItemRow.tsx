import { useTransition } from "react";
import Link from "@/routing/Link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { updateCartItemQuantity, removeCartItem } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

export type CartItemData = {
  id: string;
  quantity: number;
  product: { name: string; slug: string; images: string; thumbnail?: string };
  variant: { id: string; name: string; price: number; stock: number };
};

export function CartItemRow({ item }: { item: CartItemData }) {
  const [pending, startTransition] = useTransition();
  const { locale, t } = useI18n();

  let image = item.product.thumbnail ?? "";
  if (!image) {
    try {
      image = JSON.parse(item.product.images)[0]?.url ?? "";
    } catch {}
  }

  function updateQty(qty: number) {
    startTransition(async () => {
      await updateCartItemQuantity(item.id, qty);
      window.dispatchEvent(new Event("storefront:refresh"));
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItem(item.id);
      window.dispatchEvent(new Event("storefront:refresh"));
    });
  }

  return (
    <div className="flex gap-4 border-b border-ink-200 py-5 last:border-none">
      <Link href={`/product/${item.product.slug}`} className="shrink-0">
        <ProductImage src={image} alt={item.product.name} className="h-24 w-24 rounded-xl" sizes="100px" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/product/${item.product.slug}`} className="font-medium text-ink-900 hover:text-terracotta-700">
              {item.product.name}
            </Link>
            <p className="text-sm text-ink-500">{item.variant.name}</p>
          </div>
          <span className="font-semibold text-ink-900">{formatPrice(item.variant.price * item.quantity, locale)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-full border border-ink-300">
            <button
              onClick={() => updateQty(item.quantity - 1)}
              disabled={pending}
              aria-label={t("decreaseQuantity")}
              className="cursor-pointer p-2 text-ink-600 hover:text-terracotta-700 disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm">{pending ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : item.quantity}</span>
            <button
              onClick={() => updateQty(Math.min(item.variant.stock, item.quantity + 1))}
              disabled={pending}
              aria-label={t("increaseQuantity")}
              className="cursor-pointer p-2 text-ink-600 hover:text-terracotta-700 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={remove}
            disabled={pending}
            className="flex cursor-pointer items-center gap-1 text-sm text-ink-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" /> {t("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
