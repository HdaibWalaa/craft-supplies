import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/api/products";

export async function GET() {
  const products = (await fetchProducts({ per_page: 48 })).data;
  return NextResponse.json(products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, shortDescription: product.shortDescription,
    price: product.basePrice, image: product.images[0]?.url ?? "", categoryName: product.category.name, categorySlug: product.category.slug })),
  { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
