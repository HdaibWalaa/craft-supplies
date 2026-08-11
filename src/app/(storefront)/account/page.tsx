import type { Metadata } from "next";
import Link from "next/link";
import { Package, MapPin, Heart } from "lucide-react";
import { auth } from "@/auth";
import { fetchOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  const recentOrders = session?.user ? (await fetchOrders()).slice(0, 3) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">
        Welcome back, {session?.user?.name?.split(" ")[0]}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 hover:border-terracotta-400">
          <Package className="h-5 w-5 text-terracotta-600" />
          <p className="mt-3 font-medium text-ink-900">Orders</p>
          <p className="text-sm text-ink-500">Track and review past orders</p>
        </Link>
        <Link href="/account/addresses" className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 hover:border-terracotta-400">
          <MapPin className="h-5 w-5 text-terracotta-600" />
          <p className="mt-3 font-medium text-ink-900">Addresses</p>
          <p className="text-sm text-ink-500">Manage saved shipping addresses</p>
        </Link>
        <Link href="/account/wishlist" className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 hover:border-terracotta-400">
          <Heart className="h-5 w-5 text-terracotta-600" />
          <p className="mt-3 font-medium text-ink-900">Wishlist</p>
          <p className="text-sm text-ink-500">Items you&apos;ve saved for later</p>
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink-900">Recent Orders</h2>
          <div className="mt-4 flex flex-col divide-y divide-ink-200 rounded-3xl border border-ink-200/70">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-4 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{o.orderNumber}</p>
                  <p className="text-ink-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-ink-700">
                  {o.status}
                </span>
                <span className="font-medium text-ink-900">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
