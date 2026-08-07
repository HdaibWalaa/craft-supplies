import Link from "next/link";
import { auth } from "@/auth";
import { getCategories } from "@/lib/data";
import { getCart, getCartTotals } from "@/lib/cart";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [session, categories, cart] = await Promise.all([auth(), getCategories(), getCart()]);
  const { itemCount } = getCartTotals(cart);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-cream-50/95 backdrop-blur supports-backdrop-blur:bg-cream-50/80">
      <div className="bg-sage-900 text-cream-100">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs tracking-wide sm:px-6 lg:px-8">
          Free shipping on orders over $75 &middot;{" "}
          <Link href="/shop" className="underline underline-offset-2 hover:text-terracotta-300">
            Shop new arrivals
          </Link>
        </p>
      </div>
      <HeaderClient
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, colorTheme: c.colorTheme }))}
        cartCount={itemCount}
        user={session?.user ? { name: session.user.name ?? "", role: session.user.role } : null}
      />
    </header>
  );
}
