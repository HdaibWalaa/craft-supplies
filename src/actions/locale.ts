import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
export async function setLocale(locale: Locale) { if (!isLocale(locale)) return; localStorage.setItem(LOCALE_COOKIE, locale); document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; window.dispatchEvent(new Event("storefront:locale")); }
