export const TAX_RATE = 0.0725;

export function computeOrderTotals({
  subtotal,
  discountAmount,
  shippingCost,
}: {
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
}) {
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxTotal = taxable * TAX_RATE;
  const total = taxable + shippingCost + taxTotal;
  return { shippingCost, taxTotal, total };
}
