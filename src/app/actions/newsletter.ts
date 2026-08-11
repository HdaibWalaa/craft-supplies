"use server";

import { getLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export type NewsletterState = { error?: string; success?: boolean };

export async function subscribeToNewsletter(_previous: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const locale = await getLocale();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${apiUrl}/newsletter/subscribe`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify({ email: formData.get("email") }), cache: "no-store" });
  if (!response.ok) return { error: translate(locale, "invalidEmail") };
  return { success: true };
}
