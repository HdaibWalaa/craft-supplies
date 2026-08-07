import { prisma } from "@/lib/prisma";

export async function validateDiscountCode(code: string, subtotal: number) {
  const discount = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!discount || !discount.active) return { valid: false as const, error: "Invalid discount code." };
  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return { valid: false as const, error: "This discount code has expired." };
  }
  if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
    return { valid: false as const, error: "This discount code has reached its usage limit." };
  }
  if (subtotal < discount.minSubtotal) {
    return {
      valid: false as const,
      error: `Spend at least $${discount.minSubtotal.toFixed(2)} to use this code.`,
    };
  }

  const amount = discount.type === "PERCENT" ? subtotal * (discount.value / 100) : Math.min(discount.value, subtotal);

  return { valid: true as const, discount, amount };
}
