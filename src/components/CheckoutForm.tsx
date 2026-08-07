"use client";

import { useActionState, useState } from "react";
import { createOrder, type CheckoutState } from "@/app/actions/checkout";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { SHIPPING_METHODS, computeOrderTotals } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

const initialState: CheckoutState = {};

export function CheckoutForm({
  defaultEmail,
  defaultAddress,
  isLoggedIn,
  subtotal,
  discountAmount,
  discountCode,
  itemCount,
}: {
  defaultEmail?: string;
  defaultAddress?: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
  } | null;
  isLoggedIn: boolean;
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  itemCount: number;
}) {
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const { shippingCost, taxTotal, total } = computeOrderTotals({ subtotal, discountAmount, shippingMethod });

  return (
    <div className="grid gap-10 lg:grid-cols-3">
    <form action={formAction} className="flex flex-col gap-8 lg:col-span-2">
      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">Contact</h2>
        <div className="mt-3 flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={defaultEmail} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">Shipping Address</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required defaultValue={defaultAddress?.fullName} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="line1">Address Line 1</Label>
            <Input id="line1" name="line1" required defaultValue={defaultAddress?.line1} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="line2">Address Line 2 (optional)</Label>
            <Input id="line2" name="line2" defaultValue={defaultAddress?.line2 ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required defaultValue={defaultAddress?.city} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required defaultValue={defaultAddress?.state} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" name="postalCode" required defaultValue={defaultAddress?.postalCode} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required defaultValue={defaultAddress?.country ?? "US"} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={defaultAddress?.phone ?? ""} />
          </div>
        </div>
        {isLoggedIn ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" name="saveAddress" value="true" className="h-4 w-4 rounded border-ink-300 text-terracotta-600" />
            Save this address to my account
          </label>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">Shipping Method</h2>
        <div className="mt-3 flex flex-col gap-2">
          {(Object.entries(SHIPPING_METHODS) as [keyof typeof SHIPPING_METHODS, { label: string; price: number }][]).map(
            ([key, method]) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm",
                  shippingMethod === key ? "border-terracotta-500 bg-terracotta-50" : "border-ink-200"
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={key}
                    checked={shippingMethod === key}
                    onChange={() => setShippingMethod(key)}
                    className="h-4 w-4 text-terracotta-600"
                  />
                  {method.label}
                </span>
                <span className="font-medium text-ink-800">
                  {key === "standard" ? "From " : ""}
                  {formatPrice(method.price)}
                </span>
              </label>
            )
          )}
        </div>
      </section>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Placing Order..." : "Place Order"}
      </Button>
      <p className="text-center text-xs text-ink-400">
        This demo checkout uses Stripe test mode when configured, or a simulated payment
        otherwise — no real charge will occur.
      </p>
    </form>

      <div className="h-fit rounded-3xl border border-ink-200/70 bg-cream-50 p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold text-ink-900">Order Summary ({itemCount})</h2>
        <dl className="mt-4 flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="font-medium text-ink-800">{formatPrice(subtotal)}</dd>
          </div>
          {discountAmount > 0 ? (
            <div className="flex justify-between text-sage-700">
              <dt>Discount {discountCode ? `(${discountCode})` : ""}</dt>
              <dd>-{formatPrice(discountAmount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-500">Shipping</dt>
            <dd className="font-medium text-ink-800">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Estimated Tax</dt>
            <dd className="font-medium text-ink-800">{formatPrice(taxTotal)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 text-base">
            <dt className="font-semibold text-ink-900">Total</dt>
            <dd className="font-semibold text-ink-900">{formatPrice(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
