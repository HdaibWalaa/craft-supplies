import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { ThemeManager } from "@/components/theme/ThemeManager";
import { DEFAULT_LOCALE, isLocale, localeDirection, LOCALE_COOKIE } from "@/lib/i18n/config";
import App from "@/App";
import "@/styles/globals.css";

// Set the persisted locale direction before the first React paint. Applying RTL
// later in an effect can preserve the browser's LTR horizontal scroll origin.
const storedLocale = localStorage.getItem(LOCALE_COOKIE);
const initialLocale = isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
document.documentElement.lang = initialLocale;
document.documentElement.dir = localeDirection(initialLocale);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeManager>
      <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
    </ThemeManager>
  </StrictMode>,
);
