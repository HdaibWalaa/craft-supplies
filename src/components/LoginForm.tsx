"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { AuthFormState } from "@/app/actions/auth";

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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Signing in..." : "Log In"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href={forgotPasswordHref} className="text-terracotta-700 hover:underline">
          Forgot password?
        </Link>
        {registerHref ? (
          <Link href={registerHref} className="text-ink-600 hover:underline">
            Create an account
          </Link>
        ) : null}
      </div>
    </form>
  );
}
