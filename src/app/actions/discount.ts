"use server";

import { cookies } from "next/headers";
import { getCart, getCartTotals } from "@/lib/cart";
import { validateDiscountCode } from "@/lib/discount";

const DISCOUNT_COOKIE = "discount_code";

export async function applyDiscountCode(_prev: unknown, formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter a discount code." };

  const cart = await getCart();
  const { subtotal } = getCartTotals(cart);
  const result = await validateDiscountCode(code, subtotal);

  if (!result.valid) return { error: result.error };

  const cookieStore = await cookies();
  cookieStore.set(DISCOUNT_COOKIE, code.toUpperCase(), { path: "/", maxAge: 60 * 60 * 24 });

  return { success: true, code: code.toUpperCase(), amount: result.amount };
}

export async function removeDiscountCode() {
  const cookieStore = await cookies();
  cookieStore.delete(DISCOUNT_COOKIE);
  return { success: true };
}

export async function getAppliedDiscountCode() {
  const cookieStore = await cookies();
  return cookieStore.get(DISCOUNT_COOKIE)?.value ?? null;
}
