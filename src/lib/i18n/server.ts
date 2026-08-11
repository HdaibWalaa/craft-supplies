import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { translate, type TranslationKey } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getTranslations() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: TranslationKey, values?: Record<string, string | number>) =>
      translate(locale, key, values),
  };
}
