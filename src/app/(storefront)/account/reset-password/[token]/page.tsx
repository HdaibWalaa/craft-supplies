"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ResetState } from "@/app/actions/password-reset";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const initialState: ResetState = {};

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  if (state?.success) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Password Updated</h1>
        <p className="mt-2 text-sm text-ink-500">You can now log in with your new password.</p>
        <Link href="/account/login" className="mt-6 inline-block text-terracotta-700 hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Set a New Password</h1>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
