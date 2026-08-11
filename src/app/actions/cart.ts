"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addCartItem, ApiError, deleteCartItem, updateCartItem } from "@/lib/api/cart";

async function persistToken(token: string) {
  (await cookies()).set("cart_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 90, path: "/" });
}

export async function addToCart(variantId: string, quantity = 1) {
  try {
    const cart = await addCartItem(variantId, quantity);
    await persistToken(cart.token);
    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "This item could not be added." };
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const cart = await updateCartItem(itemId, Math.max(0, quantity));
    await persistToken(cart.token);
    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "The cart could not be updated." };
  }
}

export async function removeCartItem(itemId: string) {
  try { await deleteCartItem(itemId); revalidatePath("/cart"); return { success: true }; }
  catch (error) { return { error: error instanceof ApiError ? error.message : "The item could not be removed." }; }
}
