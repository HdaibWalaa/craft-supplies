import Link from "@/routing/Link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function SectionHeading({
  title,
  subtitle,
  href,
  hrefLabel,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-terracotta-700 hover:text-terracotta-800"
        >
          {hrefLabel ?? t("viewAll")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      ) : null}
    </div>
  );
}
