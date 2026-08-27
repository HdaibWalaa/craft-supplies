import { readClientLocale } from "@/lib/i18n/client";
import { normalizeLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";
import { apiRequest } from "@/lib/api/client";

export type NewsletterState = { error?: string; success?: boolean };

export async function subscribeToNewsletter(_previous: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const locale = normalizeLocale(readClientLocale());
  try { await apiRequest("newsletter/subscribe", { method: "POST", locale, body: JSON.stringify({ email: formData.get("email") }), cache: "no-store" }); return { success: true }; }
  catch { return { error: translate(locale, "invalidEmail") }; }
}
