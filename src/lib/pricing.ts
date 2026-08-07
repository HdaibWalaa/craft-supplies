export const FREE_SHIPPING_THRESHOLD = 75;
export const TAX_RATE = 0.0725;

export const SHIPPING_METHODS = {
  standard: { label: "Standard Shipping (3-7 business days)", price: 6.99 },
  express: { label: "Express Shipping (1-2 business days)", price: 18.99 },
} as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

export function computeShippingCost(method: ShippingMethodKey, subtotal: number) {
  if (subtotal === 0) return 0;
  if (method === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_METHODS[method].price;
}

export function computeOrderTotals({
  subtotal,
  discountAmount,
  shippingMethod,
}: {
  subtotal: number;
  discountAmount: number;
  shippingMethod: ShippingMethodKey;
}) {
  const shippingCost = computeShippingCost(shippingMethod, subtotal);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxTotal = taxable * TAX_RATE;
  const total = taxable + shippingCost + taxTotal;
  return { shippingCost, taxTotal, total };
}
