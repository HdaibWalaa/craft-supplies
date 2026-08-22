import type { ApiProduct } from "@/types/api";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

export const HERO_STYLES = ["hero_1", "hero_2"] as const;

export type HeroStyle = (typeof HERO_STYLES)[number];

export type HeroProps = {
  heroProduct: ApiProduct | null;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

export type HeroTwoSettings = {
  media: {
    type: "image" | "video";
    url: string;
    poster_url: string | null;
  } | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  primary_button: {
    label: string | null;
    url: string | null;
  };
  secondary_button: {
    label: string | null;
    url: string | null;
  };
};

export function normalizeHeroStyle(style: string | null | undefined): HeroStyle {
  return HERO_STYLES.includes(style as HeroStyle) ? style as HeroStyle : "hero_1";
}
