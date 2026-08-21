import type { Metadata } from "@/types/metadata";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping rates, delivery times, and our return policy.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">Shipping &amp; Returns</h1>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Shipping</h2>
        <ul className="mt-4 flex flex-col gap-2 text-ink-600">
          <li>&bull; Available delivery methods and current prices are shown during checkout.</li>
          <li>&bull; Orders ship within 1-2 business days from our workshop</li>
          <li>&bull; Estimated delivery: 3-7 business days within the continental US</li>
          <li>&bull; Fragile items (glass, resin) are packed with extra protective materials</li>
          <li>
            &bull; Some hazardous materials (e.g. lye) may have shipping restrictions to certain
            regions or carriers — you&apos;ll be notified at checkout if this applies to your order
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Returns</h2>
        <p className="mt-4 text-ink-600">
          We want you to love your supplies. If something isn&apos;t right, here&apos;s how returns work:
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-ink-600">
          <li>&bull; Unopened, unused items can be returned within 30 days of delivery</li>
          <li>&bull; Opened consumables (fragrance oils, lye, wax, resin, mica) can&apos;t be returned once opened, for safety reasons</li>
          <li>&bull; Molds, tools, and wooden blanks can be returned if unused and in original condition</li>
          <li>&bull; Damaged or incorrect items are replaced free of charge — just contact us with a photo within 7 days</li>
        </ul>
        <p className="mt-4 text-sm text-ink-500">
          To start a return, email support@craftsupply.test with your order number.
        </p>
      </section>
    </div>
  );
}
