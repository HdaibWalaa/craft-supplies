import type { Metadata } from "@/types/metadata";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-400">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-6 text-ink-600">
        <p>
          These Terms of Service govern your use of the Craft Supplies website and
          your purchase of products from us. By placing an order, you agree to these terms.
        </p>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Orders &amp; Payment</h2>
          <p className="mt-2">
            All prices are listed in JOD and are subject to change without notice. We reserve the
            right to refuse or cancel any order, including for pricing errors or suspected fraud.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Product Use &amp; Safety</h2>
          <p className="mt-2">
            Craft supplies such as lye, resin, and fragrance oils can be hazardous if misused.
            Product pages include relevant safety warnings and usage notes — it is your
            responsibility to follow them. We are not liable for injury or damage resulting from
            improper use of purchased materials.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Intellectual Property</h2>
          <p className="mt-2">
            All content on this site, including text, images, and branding, is the property of
            Craft Supplies and may not be reproduced without permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Limitation of Liability</h2>
          <p className="mt-2">
            We are not liable for indirect, incidental, or consequential damages arising from the
            use of our products or website, to the fullest extent permitted by law.
          </p>
        </section>
        <p className="text-sm text-ink-400">
          This is placeholder legal content generated for site scaffolding purposes. Have it
          reviewed by a qualified attorney before taking the site to production.
        </p>
      </div>
    </div>
  );
}
