import {
  Flame,
  Droplets,
  Sparkles,
  Shapes,
  Palette,
  Hammer,
  TreeDeciduous,
  Package,
  type LucideIcon,
} from "lucide-react";
import { getCategoryTheme } from "@/lib/categories";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Flame,
  Droplets,
  Sparkles,
  Shapes,
  Palette,
  Hammer,
  TreeDeciduous,
  Package,
};

export function getCategoryIcon(themeSlug: string): LucideIcon {
  const def = getCategoryTheme(themeSlug);
  return CATEGORY_ICONS[def.icon] ?? Package;
}
