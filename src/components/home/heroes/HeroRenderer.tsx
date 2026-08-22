import { Hero1 } from "./Hero1";
import { Hero2 } from "./Hero2";
import { normalizeHeroStyle, type HeroProps, type HeroTwoSettings } from "./types";

export function HeroRenderer({
  style,
  heroTwo,
  ...props
}: HeroProps & { style?: string | null; heroTwo: HeroTwoSettings }) {
  switch (normalizeHeroStyle(style)) {
    case "hero_2":
      return <Hero2 {...props} settings={heroTwo} />;
    case "hero_1":
    default:
      return <Hero1 {...props} />;
  }
}
