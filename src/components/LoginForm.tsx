"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { AuthFormState } from "@/app/actions/auth";
import { useI18n } from "@/components/i18n/LocaleProvider";

const initialState: AuthFormState = {};

export function LoginForm({
  action,
  callbackUrl,
  forgotPasswordHref = "/account/forgot-password",
  registerHref,
}: {
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  callbackUrl?: string;
  forgotPasswordHref?: string;
  registerHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t } = useI18n();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required dir="ltr" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" required dir="ltr" />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? t("signingIn") : t("logIn")}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href={forgotPasswordHref} className="text-terracotta-700 hover:underline">
          {t("forgotPassword")}
        </Link>
        {registerHref ? (
          <Link href={registerHref} className="text-ink-600 hover:underline">
            {t("createAnAccount")}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
