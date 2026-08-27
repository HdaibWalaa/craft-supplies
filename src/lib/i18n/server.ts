import { readClientLocale } from "./client";
import type { Locale } from "./config";
import { translate, type TranslationKey } from "./dictionaries";
export async function getLocale(): Promise<Locale> { return readClientLocale(); }
export async function getTranslations() { const locale = await getLocale(); return { locale, t: (key: TranslationKey, values?: Record<string, string | number>) => translate(locale, key, values) }; }
