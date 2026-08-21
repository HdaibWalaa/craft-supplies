export type CategoryTheme = {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  from: string; // tailwind gradient start
  to: string; // tailwind gradient end
  accent: string; // tailwind text/border accent class fragment
};

export const CATEGORY_DEFS: CategoryTheme[] = [
  {
    slug: "candle-making",
    name: "Candle-Making",
    description: "Waxes, wicks, containers, and tins for pouring beautiful candles.",
    icon: "Flame",
    from: "var(--color-category-cream)",
    to: "var(--color-category-cream-deep)",
    accent: "amber",
  },
  {
    slug: "resin-epoxy",
    name: "Resin & Epoxy",
    description: "Crystal-clear casting and coating resins for art, jewelry, and tables.",
    icon: "Droplets",
    from: "var(--color-category-sage)",
    to: "var(--color-category-sage-deep)",
    accent: "teal",
  },
  {
    slug: "soap-making",
    name: "Soap-Making",
    description: "Melt-and-pour bases, lye, oils, and additives for handcrafted soap.",
    icon: "Sparkles",
    from: "var(--color-category-peach)",
    to: "var(--color-category-peach-deep)",
    accent: "pink",
  },
  {
    slug: "molds",
    name: "Molds",
    description: "Silicone and plastic molds for candles, soap, resin, and concrete.",
    icon: "Shapes",
    from: "var(--color-category-sage)",
    to: "var(--color-primary)",
    accent: "sage",
  },
  {
    slug: "fragrances-pigments",
    name: "Fragrances & Pigments",
    description: "Fragrance oils, essential oils, dyes, and mica powders.",
    icon: "Palette",
    from: "var(--color-category-coral)",
    to: "var(--color-category-coral-deep)",
    accent: "purple",
  },
  {
    slug: "concrete-supplies",
    name: "Concrete Supplies",
    description: "Cement mixes, sealers, and tools for concrete and cement crafting.",
    icon: "Hammer",
    from: "var(--color-muted)",
    to: "var(--color-muted-foreground)",
    accent: "stone",
  },
  {
    slug: "wooden-products",
    name: "Wooden Products",
    description: "Bases, boxes, and décor blanks ready to finish and personalize.",
    icon: "TreeDeciduous",
    from: "var(--color-category-peach)",
    to: "var(--color-walnut-600)",
    accent: "walnut",
  },
  {
    slug: "kits-bundles",
    name: "Kits & Bundles",
    description: "Curated supply bundles that pair everything you need for a project.",
    icon: "Package",
    from: "var(--color-category-coral)",
    to: "var(--color-terracotta-600)",
    accent: "terracotta",
  },
];

export function getCategoryTheme(slug: string): CategoryTheme {
  return (
    CATEGORY_DEFS.find((c) => c.slug === slug) ?? CATEGORY_DEFS[0]
  );
}

export const AVAILABLE_THEME_SLUGS = CATEGORY_DEFS.map((c) => c.slug);
