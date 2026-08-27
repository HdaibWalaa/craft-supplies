import { applyDocumentLocale, persistClientLocale } from "@/lib/i18n/client";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  persistClientLocale(locale);
  applyDocumentLocale(locale);
  window.dispatchEvent(new Event("storefront:locale"));
}
