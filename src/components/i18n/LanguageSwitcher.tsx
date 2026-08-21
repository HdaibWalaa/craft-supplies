import { useTransition } from "react";
import { setLocale } from "@/actions/locale";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "./LocaleProvider";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    startTransition(async () => {
      await setLocale(nextLocale);
      window.dispatchEvent(new Event("storefront:refresh"));
    });
  }

  return (
    <div className="flex items-center rounded-full border border-ink-200 p-0.5" aria-label={t("switchLanguage")}>
      {(["ar", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          disabled={pending}
          onClick={() => changeLocale(value)}
          aria-pressed={locale === value}
          className={`cursor-pointer rounded-full px-2 py-1 text-xs font-medium transition-colors ${
            locale === value ? "bg-sage-900 text-cream-50" : "text-ink-600 hover:text-sage-800"
          }`}
        >
          {value === "ar" ? t("languageArabic") : t("languageEnglish")}
        </button>
      ))}
    </div>
  );
}
