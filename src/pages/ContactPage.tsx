import { Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { PageMetadata } from "@/components/PageMetadata";
import { getHomepageSettings } from "@/lib/data";
import type { ContactInformation } from "@/lib/api/homepage";

export default async function ContactPage() {
  const { contact } = await getHomepageSettings();

  return <ContactPageContent contact={contact} />;
}

function ContactPageContent({ contact }: { contact: ContactInformation }) {
  const { locale, t } = useI18n();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={direction} className="mx-auto max-w-5xl px-4 py-14 text-start sm:px-6 lg:px-8">
      <PageMetadata title={t("contactTitle")} description={t("contactSubtitle")} />
      <h1 className="font-display text-4xl font-semibold text-ink-900">{t("contactTitle")}</h1>
      <p className="mt-3 max-w-lg text-ink-600">
        {t("contactSubtitle")}
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm />

        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">{t("contactEmailLabel")}</p>
              <p dir="ltr" className="text-sm text-ink-600 rtl:text-right">{contact.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">{t("contactWorkshopLabel")}</p>
              <p className="text-sm text-ink-600">{contact.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-terracotta-600" />
            <div>
              <p className="font-medium text-ink-900">{t("contactSupportHoursLabel")}</p>
              <p dir="ltr" className="text-sm text-ink-600 rtl:text-right">{contact.support_hours}</p>
            </div>
          </div>
          <a
            href={contact.whatsapp_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-sage-700"
          >
            {t("contactWhatsapp")}
          </a>
        </div>
      </div>
    </div>
  );
}
