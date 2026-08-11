import { fetchCart, type ApiCart } from "@/lib/api/cart";

export type CartWithItems = Omit<ApiCart, "items"> & {
  items: Array<{
    id: string;
    quantity: number;
    productId: string;
    variantId: string;
    product: { id: string; name: string; slug: string; images: string };
    variant: { id: string; name: string; sku: string; price: number; stock: number };
  }>;
};

export async function getCart(): Promise<CartWithItems | null> {
  const cart = await fetchCart();
  if (!cart) return null;
  return {
    ...cart,
    items: cart.items.map((item) => ({
      id: item.id, quantity: item.quantity, productId: item.product.id, variantId: item.variant.id,
      product: { id: item.product.id, name: item.product.name, slug: item.product.slug, images: JSON.stringify(item.product.images) },
      variant: { id: item.variant.id, name: item.variant.name, sku: item.variant.sku, price: item.unitPrice, stock: item.variant.stock },
    })),
  };
}

export const getOrCreateCart = getCart;

export function getCartTotals(cart: CartWithItems | null) {
  return { itemCount: cart?.itemCount ?? 0, subtotal: cart?.subtotal ?? 0 };
}
