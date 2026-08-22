import { useActionState, useEffect, useState } from "react";
import { createOrder, type CheckoutState } from "@/actions/checkout";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { fetchShippingMethods, type ApiGovernorate, type ApiShippingMethod } from "@/lib/api/shipping";
import Link from "@/routing/Link";

const initialState: CheckoutState = {};

export function CheckoutForm({
  defaultAddress,
  isLoggedIn,
  governorates,
  subtotal,
  discountAmount,
  discountCode,
  itemCount,
}: {
  defaultAddress?: {
    fullName: string;
    phone: string;
    governorate: string;
    address: string;
  } | null;
  isLoggedIn: boolean;
  governorates: ApiGovernorate[];
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  itemCount: number;
}) {
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const [governorate, setGovernorate] = useState(defaultAddress?.governorate ?? "");
  const [shippingMethods, setShippingMethods] = useState<ApiShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [shippingLoading, setShippingLoading] = useState(Boolean(defaultAddress?.governorate));
  const { locale, t } = useI18n();
  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (!governorate) return;
    let cancelled = false;
    fetchShippingMethods(governorate)
      .then((data) => {
        if (cancelled) return;
        setShippingMethods(data);
        const selected = data.find((method) => method.is_default) ?? data[0];
        setShippingMethodId(selected ? String(selected.id) : "");
      })
      .catch(() => { if (!cancelled) setShippingMethods([]); })
      .finally(() => { if (!cancelled) setShippingLoading(false); });
    return () => { cancelled = true; };
  }, [governorate]);

  function changeGovernorate(value: string) {
    setShippingMethods([]);
    setShippingMethodId("");
    setShippingLoading(true);
    setGovernorate(value);
  }

  const shippingCost = shippingMethods.find((method) => String(method.id) === shippingMethodId)?.price ?? 0;
  const taxTotal = Math.max(0, subtotal - discountAmount) * 0.0725;
  const total = subtotal - discountAmount + shippingCost + taxTotal;

  return (
    <div className="grid gap-10 lg:grid-cols-3">
    <form action={formAction} className="flex flex-col gap-8 lg:col-span-2">
      {!isLoggedIn ? (
        <p className="rounded-xl border border-border bg-muted-soft px-4 py-3 text-sm text-ink-600">
          <Link href="/account/login?callbackUrl=%2Fcheckout" className="font-medium text-terracotta-700 hover:underline">
            {t("loginToTrackOrder")}
          </Link>
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">{t("deliveryInformation")}</h2>
        <div className="mt-3 grid gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">{t("fullName")}</Label>
            <Input id="full_name" name="full_name" required defaultValue={defaultAddress?.fullName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{t("phoneNumber")}</Label>
            <Input id="phone" name="phone" type="tel" required defaultValue={defaultAddress?.phone} dir="ltr" inputMode="tel" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="governorate">{t("governorate")}</Label>
            <Select dir={direction} name="governorate" value={governorate || undefined} onValueChange={changeGovernorate} required>
              <SelectTrigger id="governorate" dir={direction}><SelectValue placeholder={t("selectGovernorate")} /></SelectTrigger>
              <SelectContent dir={direction}>{governorates.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" name="address" type="text" required defaultValue={defaultAddress?.address} />
          </div>
        </div>
        {isLoggedIn ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" name="save_address" value="true" className="h-4 w-4 rounded border-border text-primary focus-visible:ring-ring" />
            {t("saveAddress")}
          </label>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">{t("shippingMethod")}</h2>
        <div className="mt-3 flex flex-col gap-2">
          {shippingLoading ? <p className="text-sm text-ink-500">{t("loadingShippingMethods")}</p> : null}
          {!shippingLoading && !governorate ? <p className="text-sm text-ink-500">{t("selectGovernorateForShipping")}</p> : null}
          {!shippingLoading && governorate ? shippingMethods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm",
                  shippingMethodId === String(method.id) ? "border-primary bg-muted-soft shadow-sm" : "border-border bg-card hover:border-sage-400"
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shipping_method_id"
                    value={method.id}
                    checked={shippingMethodId === String(method.id)}
                    onChange={() => setShippingMethodId(String(method.id))}
                    className="h-4 w-4 text-primary focus-visible:ring-ring"
                  />
                  <span><span className="block font-medium">{method.name}</span>{method.description ? <span className="mt-0.5 block text-xs text-ink-500">{method.description}</span> : null}</span>
                </span>
                <span className="font-medium text-ink-800">
                  {formatPrice(method.price, locale)}
                </span>
              </label>
            )
          ) : null}
          {!shippingLoading && governorate && shippingMethods.length === 0 ? <p className="rounded-lg bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800">{t("noShippingForGovernorate")}</p> : null}
        </div>
      </section>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending || shippingLoading || !shippingMethodId}>
        {pending ? t("placingOrder") : t("placeOrder")}
      </Button>
      <p className="text-center text-xs text-ink-400">
        {t("demoCheckoutNotice")}
      </p>
    </form>

      <div className="h-fit rounded-3xl border border-border/80 bg-secondary/55 p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold text-ink-900">{t("orderSummary")} ({itemCount})</h2>
        <dl className="mt-4 flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">{t("subtotal")}</dt>
            <dd className="font-medium text-ink-800">{formatPrice(subtotal, locale)}</dd>
          </div>
          {discountAmount > 0 ? (
            <div className="flex justify-between text-sage-700">
              <dt>{t("discount")} {discountCode ? `(${discountCode})` : ""}</dt>
              <dd>-{formatPrice(discountAmount, locale)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-500">{t("shipping")}</dt>
            <dd className="font-medium text-ink-800">{shippingMethodId ? (shippingCost === 0 ? t("free") : formatPrice(shippingCost, locale)) : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t("estimatedTax")}</dt>
            <dd className="font-medium text-ink-800">{formatPrice(taxTotal, locale)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 text-base">
            <dt className="font-semibold text-ink-900">{t("total")}</dt>
            <dd className="font-semibold text-ink-900">{formatPrice(total, locale)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
