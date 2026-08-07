import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-400">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-6 text-ink-600">
        <p>
          This Privacy Policy explains how Kiln &amp; Wick Craft Supply collects, uses, and
          protects your information when you use our website.
        </p>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Information We Collect</h2>
          <p className="mt-2">
            We collect information you provide directly, such as your name, email, shipping
            address, and order history. We do not collect or store your full payment card
            details — payment is processed securely by our payment provider.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">How We Use Your Information</h2>
          <p className="mt-2">
            We use your information to process orders, provide customer support, send order
            updates, and, if you opt in, send marketing emails. You can unsubscribe from
            marketing emails at any time.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Cookies</h2>
          <p className="mt-2">
            We use cookies to keep your cart contents and sign-in session across visits. If
            analytics is enabled, we may also use cookies to understand site usage.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900">Your Rights</h2>
          <p className="mt-2">
            You can request a copy of the data we hold about you, or request deletion of your
            account and data, by contacting support@craftsupply.test.
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
