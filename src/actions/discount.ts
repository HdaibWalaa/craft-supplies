import { validateApiDiscount } from "@/lib/api/discounts";
import { clientStorage } from "@/lib/storage";
export async function applyDiscountCode(_prev: unknown, formData: FormData) { const code = String(formData.get("code") ?? "").trim(); if (!code) return { error: "Enter a discount code." }; try { const result = (await validateApiDiscount(code)).data; clientStorage.setDiscountCode(result.code); return { success: true, code: result.code, amount: result.amount }; } catch (error) { return { error: error instanceof Error ? error.message : "This discount code is invalid." }; } }
export async function removeDiscountCode() { clientStorage.clearDiscountCode(); return { success: true }; }
export async function getAppliedDiscountCode() { return clientStorage.getDiscountCode(); }
