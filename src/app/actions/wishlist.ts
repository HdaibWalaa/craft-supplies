"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type ToggleWishlistResult =
  | { error: string; requiresLogin: true; wishlisted?: undefined }
  | { wishlisted: boolean; error?: undefined };

export async function toggleWishlist(
  productId: string,
  productSlug: string
): Promise<ToggleWishlistResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Please log in to save items to your wishlist.", requiresLogin: true };
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath(`/product/${productSlug}`);
    revalidatePath("/account/wishlist");
    return { wishlisted: false };
  }

  await prisma.wishlist.create({ data: { userId: session.user.id, productId } });
  revalidatePath(`/product/${productSlug}`);
  revalidatePath("/account/wishlist");
  return { wishlisted: true };
}
