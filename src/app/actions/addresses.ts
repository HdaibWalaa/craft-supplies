"use server";

import { revalidatePath } from "next/cache";
import { createAddress, makeDefaultAddress, removeAddress } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";

export type AddressFormState = { error?: string };

export async function addAddress(_previous: AddressFormState, formData: FormData): Promise<AddressFormState> {
  try {
    await createAddress({ full_name: formData.get("full_name"), phone: formData.get("phone"), governorate: formData.get("governorate"), address: formData.get("address") });
    revalidatePath("/account/addresses"); return {};
  } catch (error) { return { error: error instanceof ApiError ? error.message : "Please check the address fields." }; }
}
export async function deleteAddress(id: string) { await removeAddress(id); revalidatePath("/account/addresses"); return { success: true }; }
export async function setDefaultAddress(id: string) { await makeDefaultAddress(id); revalidatePath("/account/addresses"); return { success: true }; }
