import Link from "@/routing/Link";
import { auth } from "@/auth";
import { getCategories, getHomepageSettings } from "@/lib/data";
import { getCart, getCartTotals } from "@/lib/cart";
import { HeaderClient } from "./HeaderClient";
import { getTranslations } from "@/lib/i18n/server";

export async function Header() {
  const [session, categories, cart, { t }, { contact }] = await Promise.all([auth(), getCategories(), getCart(), getTranslations(), getHomepageSettings()]);
  const { itemCount } = getCartTotals(cart);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur supports-backdrop-blur:bg-card/85">
      <div className="bg-sage-300 text-sage-950">
        <p className="mx-auto max-w-7xl break-words px-4 py-2 text-center text-xs tracking-wide sm:px-6 lg:px-8">
          {t("freeShippingBanner")} &middot;{" "}
          <Link href="/shop" className="font-medium underline underline-offset-2 hover:text-sage-800">
            {t("shopNewArrivals")}
          </Link>
        </p>
      </div>
      <HeaderClient
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, colorTheme: c.colorTheme }))}
        cartCount={itemCount}
      user={session?.user ? { name: session.user.name ?? "", role: session.user.role } : null}
      whatsappUrl={contact.whatsapp_url}
      />
    </header>
  );
}
