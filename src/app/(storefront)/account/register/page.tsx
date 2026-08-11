"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAccount, type RegisterState } from "@/app/actions/register";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LocaleProvider";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAccount, initialState);
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink-900">{t("createAccountTitle")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t("createAccountDescription")}</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required minLength={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required dir="ltr" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" name="password" type="password" required minLength={8} dir="ltr" />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t("alreadyAccount")}{" "}
        <Link href="/account/login" className="text-terracotta-700 hover:underline">
          {t("logIn")}
        </Link>
      </p>
    </div>
  );
}
