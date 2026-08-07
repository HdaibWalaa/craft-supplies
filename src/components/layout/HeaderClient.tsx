"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Heart, User, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { getCategoryIcon } from "@/lib/category-icons";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type CategoryLite = { slug: string; name: string; colorTheme: string };

const STATIC_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/blog", label: "Tutorials & Ideas" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderClient({
  categories,
  cartCount,
  user,
}: {
  categories: CategoryLite[];
  cartCount: number;
  user: { name: string; role: "CUSTOMER" | "ADMIN" } | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-20 items-center gap-4 py-3 md:h-24">
        <button
          className="cursor-pointer rounded-md p-2 text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex shrink-0 flex-col items-start">
          <span className="font-serif text-2xl font-semibold tracking-tight text-walnut-950 sm:text-[1.75rem]">
            Kiln &amp; Wick
          </span>
          <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400 sm:block">
            Handmade Craft Supply
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-ink-800 hover:text-sage-700"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((o) => !o)}
              onKeyDown={(e) => e.key === "Escape" && setMegaOpen(false)}
            >
              Shop by Category
              <ChevronDown className="h-4 w-4" />
            </button>
            {megaOpen ? (
              <div className="absolute left-0 top-full w-[36rem] rounded-3xl border border-ink-200 bg-cream-50 p-4 shadow-[var(--shadow-card-hover)]">
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => {
                    const Icon = getCategoryIcon(c.colorTheme);
                    return (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-terracotta-50"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-700">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-sm font-medium text-ink-800">{c.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {STATIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-ink-800 hover:text-sage-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <SearchBar className="max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full p-2 text-ink-700 hover:text-sage-700 sm:inline-flex"
            aria-label="Chat with us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 0 0 4.62 1.15h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.17-4.94-4.36-.15-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.73-.17 1.42z" />
            </svg>
          </a>

          <Link
            href="/account/wishlist"
            className="hidden rounded-full p-2 text-ink-700 hover:text-sage-700 sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full p-2 text-ink-700 hover:text-sage-700"
              aria-label="Account menu"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">
                {user ? user.name.split(" ")[0] : "Account"}
              </span>
            </button>
            {accountOpen ? (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-ink-200 bg-cream-50 p-1.5 shadow-[var(--shadow-card-hover)]">
                {user ? (
                  <>
                    <Link href="/account/orders" className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-terracotta-50">
                      My Orders
                    </Link>
                    <Link href="/account/wishlist" className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-terracotta-50">
                      Wishlist
                    </Link>
                    <Link href="/account/addresses" className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-terracotta-50">
                      Addresses
                    </Link>
                    {user.role === "ADMIN" ? (
                      <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-terracotta-700 hover:bg-terracotta-50">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    ) : null}
                    <form action={signOutAction}>
                      <button type="submit" className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-800 hover:bg-terracotta-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/account/login" className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-terracotta-50">
                      Log In
                    </Link>
                    <Link href="/account/register" className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-terracotta-50">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <Link
            href="/cart"
            className="relative rounded-full p-2 text-ink-700 hover:text-sage-700"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta-600 px-1 text-[10px] font-bold text-cream-50">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="pb-3 lg:hidden">
        <SearchBar />
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setMobileOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-cream-50 p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-serif text-xl font-semibold text-walnut-950">Menu</span>
              <button
                autoFocus
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md p-2 hover:bg-ink-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Categories
            </p>
            <div className="mb-4 flex flex-col">
              {categories.map((c) => {
                const Icon = getCategoryIcon(c.colorTheme);
                return (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-ink-800 hover:bg-terracotta-50")}
                  >
                    <Icon className="h-4 w-4 text-terracotta-600" />
                    {c.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-ink-200 pt-3">
              {STATIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-800 hover:bg-terracotta-50"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
