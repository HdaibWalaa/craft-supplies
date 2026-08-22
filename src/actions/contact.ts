import { apiRequest } from "@/lib/api/client";

export type ContactFormState = { error?: boolean; success?: boolean };

export async function submitContactForm(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  try { await apiRequest("contact", { method: "POST", body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") }), cache: "no-store" }); return { success: true }; }
  catch { return { error: true }; }
}
