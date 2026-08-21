import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: Locale = "en") {
  const value = new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return locale === "ar" ? `${value} دينار` : `JOD ${value}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
