import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const CART_COOKIE = "cart_token";

const CART_INCLUDE = {
  items: {
    include: { product: true, variant: true },
    orderBy: { createdAt: "asc" as const },
  },
};

export type CartWithItems = NonNullable<
  Awaited<ReturnType<typeof prisma.cart.findFirst<{ include: typeof CART_INCLUDE }>>>
>;

/** Read-only cart lookup for rendering (header count, cart page). Never mutates cookies. */
export async function getCart(): Promise<CartWithItems | null> {
  const session = await auth();
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: CART_INCLUDE,
    });
    if (cart) return cart;
  }

  if (token) {
    const cart = await prisma.cart.findUnique({
      where: { token },
      include: CART_INCLUDE,
    });
    if (cart) return cart;
  }

  return null;
}

/**
 * Cart lookup/creation for use inside Server Actions (where setting cookies
 * is allowed). Merges a guest cart into the user's account cart on login.
 */
export async function getOrCreateCart(): Promise<CartWithItems> {
  const session = await auth();
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user) {
    let userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: CART_INCLUDE,
    });

    if (token && (!userCart || userCart.items.length === 0)) {
      const guestCart = await prisma.cart.findUnique({
        where: { token },
        include: CART_INCLUDE,
      });
      if (guestCart && guestCart.userId !== session.user.id) {
        if (!userCart) {
          userCart = await prisma.cart.update({
            where: { id: guestCart.id },
            data: { userId: session.user.id },
            include: CART_INCLUDE,
          });
        } else {
          for (const item of guestCart.items) {
            await prisma.cartItem.upsert({
              where: {
                cartId_variantId: { cartId: userCart.id, variantId: item.variantId },
              },
              update: { quantity: { increment: item.quantity } },
              create: {
                cartId: userCart.id,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              },
            });
          }
          await prisma.cart.delete({ where: { id: guestCart.id } });
          userCart = await prisma.cart.findUnique({
            where: { id: userCart.id },
            include: CART_INCLUDE,
          });
        }
      }
    }

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { token: randomUUID(), userId: session.user.id },
        include: CART_INCLUDE,
      });
    }

    return userCart!;
  }

  if (!token) {
    token = randomUUID();
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }

  const cart = await prisma.cart.upsert({
    where: { token },
    update: {},
    create: { token },
    include: CART_INCLUDE,
  });

  return cart;
}

export function getCartTotals(cart: CartWithItems | null) {
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  return { itemCount, subtotal };
}
