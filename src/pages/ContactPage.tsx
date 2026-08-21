import type { Metadata } from "@/types/metadata";
import { Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Craft Supplies team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-ink-900">Contact Us</h1>
      <p className="mt-3 max-w-lg text-ink-600">
        Questions about an order, a supply, or a project? Send us a message and we&apos;ll get
        back to you within 1 business day.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm />

        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">Email</p>
              <p className="text-sm text-ink-600">support@craftsupply.test</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">Workshop</p>
              <p className="text-sm text-ink-600">123 Maker Lane, Portland, OR 97201</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">Support Hours</p>
              <p className="text-sm text-ink-600">Mon&ndash;Fri, 9am&ndash;5pm PT</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-sage-700"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
