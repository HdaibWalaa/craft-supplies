import {
  DEFAULT_LOCALE,
  isLocale,
  localeDirection,
  LOCALE_COOKIE,
  type Locale,
} from "./config";

export function readClientLocale(): Locale {
  try {
    const value = window.localStorage.getItem(LOCALE_COOKIE);
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function applyDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = localeDirection(locale);
}

export function persistClientLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // In-memory locale switching still works when persistence is unavailable.
  }
}
