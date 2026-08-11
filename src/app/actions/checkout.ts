"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { submitCheckout } from "@/lib/api/checkout";

export type CheckoutState = { error?: string };

export async function createOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const fullName = String(formData.get("fullName") ?? "").trim().split(/\s+/); const lastName = fullName.pop() ?? "";
  try {
    const result = await submitCheckout({ email: formData.get("email"), shipping_method: formData.get("shippingMethod") || "standard", discount_code: (await cookies()).get("discount_code")?.value,
      shipping_address: { first_name: fullName.join(" ") || lastName, last_name: fullName.length ? lastName : "-", line_1: formData.get("line1"), line_2: formData.get("line2") || null,
        city: formData.get("city"), region: formData.get("state") || null, postal_code: formData.get("postalCode") || null, country_code: formData.get("country") || "US", phone: formData.get("phone") || null } });
    const cookieStore = await cookies(); cookieStore.delete("discount_code");
    if (result.checkout_url) redirect(result.checkout_url);
    redirect(`/checkout/success?order=${result.order.orderNumber}&token=${result.order.accessToken}`);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
}
