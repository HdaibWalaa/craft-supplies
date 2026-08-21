import { ApiError } from "@/lib/api/client";
import { submitCheckout } from "@/lib/api/checkout";
import { clientStorage } from "@/lib/storage";
export type CheckoutState = { error?: string };
export async function createOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> { try { const result = await submitCheckout({ full_name: formData.get("full_name"), phone: formData.get("phone"), governorate: formData.get("governorate"), address: formData.get("address"), save_address: formData.get("save_address") === "true", shipping_method_id: Number(formData.get("shipping_method_id")), discount_code: clientStorage.getDiscountCode() }); clientStorage.clearDiscountCode(); window.location.assign(result.checkout_url || `/checkout/success?order=${result.order.orderNumber}&token=${result.order.accessToken}`); return {}; } catch (error) { return { error: error instanceof ApiError ? error.message : "Checkout could not be completed." }; } }
