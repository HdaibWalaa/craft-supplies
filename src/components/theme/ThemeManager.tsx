import { useEffect, type ReactNode } from "react";
import { fetchHomepageSettings } from "@/lib/api/homepage";
import { DEFAULT_WEBSITE_THEME, normalizeWebsiteTheme } from "@/lib/theme/themes";

function applyTheme(theme: unknown) {
  document.documentElement.dataset.theme = normalizeWebsiteTheme(theme);
}

export function ThemeManager({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme(DEFAULT_WEBSITE_THEME);
    const controller = new AbortController();

    void fetchHomepageSettings({ signal: controller.signal })
      .then(({ data }) => applyTheme(data.appearance?.theme))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          applyTheme(DEFAULT_WEBSITE_THEME);
        }
      });

    return () => controller.abort();
  }, []);

  return children;
}
