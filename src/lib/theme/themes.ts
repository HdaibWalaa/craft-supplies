export const themes = {
  theme_1: {
    label: "Theme 1",
    palette: {
      navy: "#2F4156",
      teal: "#567C8D",
      skyBlue: "#C8D9E6",
      beige: "#F5EFEB",
      white: "#FFFFFF",
    },
  },
} as const;

export type WebsiteTheme = keyof typeof themes;
export const DEFAULT_WEBSITE_THEME: WebsiteTheme = "theme_1";

export function normalizeWebsiteTheme(value: unknown): WebsiteTheme {
  return typeof value === "string" && value in themes
    ? (value as WebsiteTheme)
    : DEFAULT_WEBSITE_THEME;
}
