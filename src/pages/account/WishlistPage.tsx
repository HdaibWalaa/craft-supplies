import Link from "@/routing/Link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { fetchWishlist } from "@/lib/api/wishlist";
import { ProductGrid } from "@/components/ProductRail";
import { Button } from "@/components/ui/Button";

export default async function WishlistPage() {
  const session = await auth();
  const products = session ? await fetchWishlist() : [];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Your Wishlist</h1>
      {products.length ? <div className="mt-8"><ProductGrid products={products} /></div> : (
        <div className="flex flex-col items-center py-20 text-center"><Heart className="h-12 w-12 text-ink-300" /><p className="mt-4 text-ink-500">Your wishlist is empty.</p><Button asChild className="mt-5"><Link href="/shop">Browse supplies</Link></Button></div>
      )}
    </div>
  );
}
