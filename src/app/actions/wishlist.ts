"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { addWishlistProduct, fetchWishlist, removeWishlistProduct } from "@/lib/api/wishlist";

type ToggleWishlistResult = { error: string; requiresLogin: true; wishlisted?: undefined } | { wishlisted: boolean; error?: undefined };

export async function toggleWishlist(productId: string, productSlug: string): Promise<ToggleWishlistResult> {
  if (!await auth()) return { error: "Please log in to save items to your wishlist.", requiresLogin: true };
  const existing = (await fetchWishlist()).some((product) => product.id === productId);
  if (existing) await removeWishlistProduct(productId); else await addWishlistProduct(productId);
  revalidatePath(`/product/${productSlug}`); revalidatePath("/account/wishlist");
  return { wishlisted: !existing };
}
