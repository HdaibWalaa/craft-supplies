import type { Metadata } from "next";
import { Flame, Heart, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind Craft Supplies.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">About Craft Supplies</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-600">
        Craft Supplies started the way most craft supply shelves do — with too much leftover soy
        wax, a drawer of half-used mica powders, and a hunch that other makers were dealing with
        the exact same clutter. We built the shop we wished existed: one place for candle,
        resin, soap, mold, fragrance, concrete, and wood supplies, without hunting across a dozen
        different stores.
      </p>
      <p className="mt-4 leading-relaxed text-ink-600">
        Every material we carry gets tested in our own workshop first. If a wax doesn&apos;t throw
        scent well, or a mold releases badly, it doesn&apos;t make it onto the shelf — whether
        you&apos;re pouring your first candle or running a small batch business, we want the
        supplies to be the reliable part of the process.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <div>
          <Flame className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">Maker-Tested</h3>
          <p className="mt-1 text-sm text-ink-600">Every material is tested in-house before we sell it.</p>
        </div>
        <div>
          <Users className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">For Every Level</h3>
          <p className="mt-1 text-sm text-ink-600">From first-timers to small businesses stocking up.</p>
        </div>
        <div>
          <Heart className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">Small Team, Big Care</h3>
          <p className="mt-1 text-sm text-ink-600">Every order is packed by hand, with care for fragile items.</p>
        </div>
      </div>
    </div>
  );
}
