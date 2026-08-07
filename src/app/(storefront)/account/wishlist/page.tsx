import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/ProductRail";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session!.user.id },
    include: {
      product: {
        include: {
          variants: { select: { id: true, price: true, stock: true }, orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <Heart className="h-10 w-10 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Your wishlist is empty</h1>
        <p className="mt-2 text-ink-500">Save items you love for later.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse the Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Wishlist</h1>
      <div className="mt-8">
        <ProductGrid products={wishlist.map((w) => w.product)} />
      </div>
    </div>
  );
}
