import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { translate, type TranslationKey } from "./dictionaries";
export async function getLocale(): Promise<Locale> { const value = localStorage.getItem(LOCALE_COOKIE); return isLocale(value) ? value : DEFAULT_LOCALE; }
export async function getTranslations() { const locale = await getLocale(); return { locale, t: (key: TranslationKey, values?: Record<string, string | number>) => translate(locale, key, values) }; }
