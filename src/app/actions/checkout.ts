"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { submitCheckout } from "@/lib/api/checkout";

export type CheckoutState = { error?: string };

export async function createOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  try {
    const result = await submitCheckout({ full_name: formData.get("full_name"), phone: formData.get("phone"), governorate: formData.get("governorate"),
      address: formData.get("address"), save_address: formData.get("save_address") === "true", shipping_method_id: Number(formData.get("shipping_method_id")),
      discount_code: (await cookies()).get("discount_code")?.value });
    const cookieStore = await cookies(); cookieStore.delete("discount_code");
    if (result.checkout_url) redirect(result.checkout_url);
    redirect(`/checkout/success?order=${result.order.orderNumber}&token=${result.order.accessToken}`);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
}
