import { createAddress, makeDefaultAddress, removeAddress } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
export type AddressFormState = { error?: string };
const refresh = () => window.dispatchEvent(new Event("storefront:refresh"));
export async function addAddress(_previous: AddressFormState, formData: FormData): Promise<AddressFormState> { try { await createAddress({ full_name: formData.get("full_name"), phone: formData.get("phone"), governorate: formData.get("governorate"), address: formData.get("address") }); refresh(); return {}; } catch (error) { return { error: error instanceof ApiError ? error.message : "Please check the address fields." }; } }
export async function deleteAddress(id: string) { await removeAddress(id); refresh(); return { success: true }; }
export async function setDefaultAddress(id: string) { await makeDefaultAddress(id); refresh(); return { success: true }; }
