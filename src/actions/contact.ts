import { apiRequest } from "@/lib/api/client";

export type ContactFormState = { error?: string; success?: boolean };

export async function submitContactForm(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  try { await apiRequest("contact", { method: "POST", body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") }), cache: "no-store" }); return { success: true }; }
  catch { return { error: "Please fill in all fields with a valid email address." }; }
}
