import type { Metadata } from "@/types/metadata";
import { LoginForm } from "@/components/LoginForm";
import { authenticate } from "@/actions/auth";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Log In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink-900">{t("welcomeBack")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t("loginDescription")}</p>
      <div className="mt-6">
        <LoginForm action={authenticate} callbackUrl={callbackUrl} registerHref="/account/register" />
      </div>
      <p className="mt-6 text-center text-xs text-ink-400">
        Demo account: customer@example.test / Customer123!
      </p>
    </div>
  );
}
