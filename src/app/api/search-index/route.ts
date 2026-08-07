import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/data";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      images: true,
      basePrice: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const index = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    price: p.basePrice,
    image: parseImages(p.images)[0]?.url ?? "",
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  return NextResponse.json(index, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
