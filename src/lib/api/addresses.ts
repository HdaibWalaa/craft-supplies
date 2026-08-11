import { apiRequest } from "@/lib/api/client";

export type ApiAddress = { id: number; first_name: string; last_name: string; company: string | null; phone: string | null; line_1: string; line_2: string | null; city: string; region: string | null; postal_code: string | null; country_code: string; is_default_shipping: boolean; is_default_billing: boolean };
export async function fetchAddresses() { return (await apiRequest<{ data: ApiAddress[] }>("addresses", { cache: "no-store" })).data; }
export async function createAddress(data: Record<string, unknown>) { return apiRequest("addresses", { method: "POST", body: JSON.stringify(data), cache: "no-store" }); }
export async function removeAddress(id: string) { return apiRequest(`addresses/${id}`, { method: "DELETE", cache: "no-store" }); }
export async function makeDefaultAddress(id: string) { return apiRequest(`addresses/${id}/default`, { method: "PATCH", cache: "no-store" }); }
