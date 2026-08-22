import Link from "@/routing/Link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ProductImage";
import { Hero1 } from "./Hero1";
import type { HeroProps, HeroTwoSettings } from "./types";

type HeroTwoProps = HeroProps & {
  settings: HeroTwoSettings;
};

export function Hero2({ settings, ...heroOneProps }: HeroTwoProps) {
  if (!settings.media?.url) {
    return <Hero1 {...heroOneProps} />;
  }

  const { t } = heroOneProps;
  const title = settings.title ?? t("heroTitle");
  const primaryLabel = settings.primary_button.label ?? t("shopAllSupplies");
  const primaryUrl = settings.primary_button.url ?? "/shop";
  const description = settings.description ?? t("heroDescription");
  const showSecondary = Boolean(
    settings.secondary_button.label && settings.secondary_button.url,
  );

  return (
    <section className="relative isolate w-full max-w-full min-w-0 overflow-hidden bg-walnut-950 text-cream-50 sm:min-h-[68svh] lg:min-h-[78svh]">
      {settings.media.type === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={settings.media.url}
          poster={settings.media.poster_url ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : (
        <ProductImage
          src={settings.media.url}
          alt={title}
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          priority
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/85 via-walnut-950/20 to-walnut-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/20 via-transparent to-walnut-950/20" />

      <div className="relative mx-auto flex min-h-[70svh] w-full max-w-7xl min-w-0 items-end px-4 pb-8 pt-20 sm:min-h-[68svh] sm:px-6 sm:pb-14 sm:pt-28 lg:min-h-[78svh] lg:px-8 lg:pb-16">
        <div className="grid w-full min-w-0 grid-cols-1 items-end gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)] md:gap-12 lg:gap-20">
          <div className="min-w-0 max-w-4xl text-start">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100 sm:text-sm">
                {settings.eyebrow ?? t("newCollection")}
              </p>
            </div>
            <h1 className="mt-4 max-w-full break-words font-serif text-3xl font-semibold leading-[1.05] text-white drop-shadow-sm sm:text-6xl sm:leading-[0.98] lg:text-7xl xl:text-8xl">
              {title}
            </h1>
            <p className="mt-4 max-w-full break-words text-start text-sm leading-6 text-cream-100 sm:text-base md:hidden">
              {description}
            </p>
            <div className="mt-6 flex min-w-0 flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full min-w-0 max-w-full whitespace-normal rounded-none px-4 text-center sm:w-auto sm:px-7">
                <Link href={primaryUrl}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              {showSecondary ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full min-w-0 max-w-full whitespace-normal rounded-none border-cream-50 px-4 text-center text-cream-50 hover:bg-cream-50 hover:text-walnut-950 sm:w-auto sm:px-7"
                >
                  <Link href={settings.secondary_button.url!}>
                    {settings.secondary_button.label}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <p className="hidden min-w-0 max-w-md break-words text-start text-sm leading-7 text-cream-100 sm:text-base md:block md:justify-self-end md:pb-1">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
