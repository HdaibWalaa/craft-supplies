import type { Metadata } from "@/types/metadata";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ordering, shipping, and using craft supplies safely.",
};

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Most orders ship within 1-2 business days and arrive within 3-7 business days, depending on your location. You'll get a tracking link by email as soon as your order ships.",
  },
  {
    q: "Is it safe to work with lye or resin at home?",
    a: "Yes, with the right precautions. Always work in a ventilated area, wear gloves and eye protection, and follow the usage notes and safety warnings listed on each product page. Never add water to lye — always add lye to water.",
  },
  {
    q: "Do you ship fragile items like glass jars or resin safely?",
    a: "Yes — glass, resin, and other fragile items are packed with extra padding and marked fragile. If anything arrives damaged, contact us within 7 days for a replacement.",
  },
  {
    q: "Can I return opened supplies?",
    a: "Unopened supplies can be returned within 30 days. Because of the nature of craft materials (fragrance oils, lye, resin, etc.), opened consumable items generally can't be returned — see our Shipping & Returns page for full details.",
  },
  {
    q: "Do you offer bulk pricing for small businesses?",
    a: "Many of our supplies come in multiple sizes, including bulk bags for waxes, oils, and concrete mixes. Contact us if you need a custom quantity not listed.",
  },
  {
    q: "How do I know which wick size to use?",
    a: "Wick size depends on your container diameter and wax type. As a general guide, a CD6 wick suits containers under 2.5in, CD10 suits 2.5-3.5in, and CD18 suits larger pours — always test burn before selling finished candles.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">Frequently Asked Questions</h1>
      <div className="mt-8 flex flex-col divide-y divide-ink-200">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink-900">
              {item.q}
              <span className="ml-4 shrink-0 text-ink-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
