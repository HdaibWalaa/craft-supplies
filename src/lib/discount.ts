import { ApiError } from "@/lib/api/client";
import { validateApiDiscount } from "@/lib/api/discounts";

export async function validateDiscountCode(code: string, subtotal?: number) {
  void subtotal;
  try {
    const result = await validateApiDiscount(code);
    return { valid: true as const, discount: { code: result.data.code }, amount: result.data.amount };
  } catch (error) {
    return { valid: false as const, error: error instanceof ApiError ? error.message : "Invalid discount code." };
  }
}
