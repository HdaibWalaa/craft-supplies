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
    from: "#e8a35c",
    to: "#c96f34",
    accent: "amber",
  },
  {
    slug: "resin-epoxy",
    name: "Resin & Epoxy",
    description: "Crystal-clear casting and coating resins for art, jewelry, and tables.",
    icon: "Droplets",
    from: "#7fc4c9",
    to: "#3f8f96",
    accent: "teal",
  },
  {
    slug: "soap-making",
    name: "Soap-Making",
    description: "Melt-and-pour bases, lye, oils, and additives for handcrafted soap.",
    icon: "Sparkles",
    from: "#e8c4d8",
    to: "#c47fa8",
    accent: "pink",
  },
  {
    slug: "molds",
    name: "Molds",
    description: "Silicone and plastic molds for candles, soap, resin, and concrete.",
    icon: "Shapes",
    from: "#a3b899",
    to: "#6b8560",
    accent: "sage",
  },
  {
    slug: "fragrances-pigments",
    name: "Fragrances & Pigments",
    description: "Fragrance oils, essential oils, dyes, and mica powders.",
    icon: "Palette",
    from: "#c9a3e0",
    to: "#8f5fb0",
    accent: "purple",
  },
  {
    slug: "concrete-supplies",
    name: "Concrete Supplies",
    description: "Cement mixes, sealers, and tools for concrete and cement crafting.",
    icon: "Hammer",
    from: "#b0a89e",
    to: "#7a7168",
    accent: "stone",
  },
  {
    slug: "wooden-products",
    name: "Wooden Products",
    description: "Bases, boxes, and décor blanks ready to finish and personalize.",
    icon: "TreeDeciduous",
    from: "#c9975f",
    to: "#8f6437",
    accent: "walnut",
  },
  {
    slug: "kits-bundles",
    name: "Kits & Bundles",
    description: "Curated supply bundles that pair everything you need for a project.",
    icon: "Package",
    from: "#e0996b",
    to: "#b0603a",
    accent: "terracotta",
  },
];

export function getCategoryTheme(slug: string): CategoryTheme {
  return (
    CATEGORY_DEFS.find((c) => c.slug === slug) ?? CATEGORY_DEFS[0]
  );
}

export const AVAILABLE_THEME_SLUGS = CATEGORY_DEFS.map((c) => c.slug);
