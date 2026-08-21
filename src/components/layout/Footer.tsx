import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getCategories } from "@/lib/data";
import { NewsletterForm } from "./NewsletterForm";
import { SocialIcon } from "@/components/SocialIcon";
import { getTranslations } from "@/lib/i18n/server";

export async function Footer() {
  const [categories, { t }] = await Promise.all([getCategories(), getTranslations()]);
  const companyLinks = [{ href: "/about", label: t("aboutUs") }, { href: "/blog", label: t("tutorialsInspiration") }, { href: "/contact", label: t("contact") }];
  const supportLinks = [{ href: "/faq", label: t("faq") }, { href: "/shipping-returns", label: t("shippingReturns") }, { href: "/terms", label: t("terms") }, { href: "/privacy", label: t("privacy") }];

  return (
    <footer className="mt-24 bg-sage-900 text-cream-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <span className="font-display text-2xl font-semibold text-cream-50">Craft Supplies</span>
            <p className="mt-3 max-w-xs text-sm text-cream-300">
              {t("footerDescription")}
            </p>
            <p className="mt-5 text-sm font-medium text-cream-100">{t("newsletterOffer")}</p>
            <div className="mt-2">
              <NewsletterForm />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">{t("shopAll")}</h3>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-sm text-cream-300 hover:text-terracotta-300">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">{t("company")}</h3>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-300 hover:text-terracotta-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">{t("support")}</h3>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-300 hover:text-terracotta-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-cream-100/10 py-6 text-sm text-cream-300">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sage-400" /> {t("secureCheckout")}
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-sage-400" /> {t("carefulShipping")}
          </span>
          <span className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-sage-400" /> {t("easyReturns")}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-cream-400">
            &copy; {new Date().getFullYear()} Craft Supplies. {t("rightsReserved")}
          </p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="text-cream-300 hover:text-terracotta-300">
              <SocialIcon name="instagram" className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="text-cream-300 hover:text-terracotta-300">
              <SocialIcon name="facebook" className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="text-cream-300 hover:text-terracotta-300">
              <SocialIcon name="youtube" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
