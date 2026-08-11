"use server";

import { revalidatePath } from "next/cache";
import { createAddress, makeDefaultAddress, removeAddress } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";

export type AddressFormState = { error?: string };

export async function addAddress(_previous: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const names = String(formData.get("fullName") ?? "").trim().split(/\s+/); const lastName = names.pop() ?? "";
  try {
    await createAddress({ first_name: names.join(" ") || lastName, last_name: names.length ? lastName : "-", line_1: formData.get("line1"), line_2: formData.get("line2") || null,
      city: formData.get("city"), region: formData.get("state") || null, postal_code: formData.get("postalCode") || null, country_code: formData.get("country") || "US", phone: formData.get("phone") || null });
    revalidatePath("/account/addresses"); return {};
  } catch (error) { return { error: error instanceof ApiError ? error.message : "Please check the address fields." }; }
}
export async function deleteAddress(id: string) { await removeAddress(id); revalidatePath("/account/addresses"); return { success: true }; }
export async function setDefaultAddress(id: string) { await makeDefaultAddress(id); revalidatePath("/account/addresses"); return { success: true }; }
