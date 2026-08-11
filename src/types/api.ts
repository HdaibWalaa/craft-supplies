export type ApiMedia = {
  id: string;
  url: string;
  thumb: string;
  medium: string;
  large: string;
  alt: string;
  order: number;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  colorTheme: string;
  sortOrder: number;
  productCount?: number;
  _count: { products: number };
  image?: ApiMedia | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type ApiProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
  attributes: Record<string, string> | string;
};

export type ApiProductAttribute = { id: string; name: string; slug: string; value: string };
export type ApiReview = { id: string; rating: number; title: string | null; comment: string; authorName: string; createdAt: string; images: ApiMedia[] };

export type ApiProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string;
  description: string;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  isNewArrival: boolean;
  isBundle: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  category: ApiCategory;
  variants: ApiProductVariant[];
  images: ApiMedia[];
  attributes: ApiProductAttribute[];
  specifications: Record<string, string>;
  safetyWarnings: string | null;
  usageNotes: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
  relatedProducts?: ApiProduct[];
  bundleItemIds?: string;
  reviews: ApiReview[];
};

export type ApiCollection<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; from: number | null; last_page: number; per_page: number; to: number | null; total: number };
};

export type ApiResource<T> = { data: T };

export type ApiBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageTheme: string;
  featuredImage: ApiMedia | null;
  publishedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  relatedProducts: { product: ApiProduct }[];
};
