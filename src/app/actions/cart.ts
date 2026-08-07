"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

export async function addToCart(variantId: string, quantity: number = 1) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return { error: "This item is no longer available." };
  if (variant.stock <= 0) return { error: "This item is out of stock." };

  const cart = await getOrCreateCart();
  const existing = cart.items.find((i) => i.variantId === variantId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stock) {
    return { error: `Only ${variant.stock} left in stock.` };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: nextQuantity },
    create: {
      cartId: cart.id,
      productId: variant.productId,
      variantId,
      quantity,
    },
  });

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
  } else {
    const item = await prisma.cartItem.findUnique({ include: { variant: true }, where: { id: itemId } });
    if (!item) return { error: "Item not found." };
    const capped = Math.min(quantity, item.variant.stock);
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: capped } });
  }
  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
  revalidatePath("/cart");
  return { success: true };
}
