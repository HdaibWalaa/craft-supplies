import { apiRequest } from "@/lib/api/client";
import type { HeroStyle, HeroTwoSettings } from "@/components/home/heroes/types";
import type { WebsiteTheme } from "@/lib/theme/themes";

export type HomepageSettings = {
  appearance: { theme: WebsiteTheme };
  hero_style: HeroStyle;
  hero_2: HeroTwoSettings;
  contact: ContactInformation;
};

export type ContactInformation = {
  email: string;
  address: string;
  support_hours: string;
  whatsapp_display: string;
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
};

export async function fetchHomepageSettings(options: { signal?: AbortSignal } = {}) {
  return apiRequest<{ data: HomepageSettings }>("homepage-settings", {
    cache: "no-store",
    signal: options.signal,
  });
}
