"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ResetState } from "@/app/actions/password-reset";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const initialState: ResetState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Reset Your Password</h1>
      <p className="mt-1 text-sm text-ink-500">
        Enter your email and we&apos;ll send a reset link (logged to the server console in this demo).
      </p>

      {state?.success ? (
        <div className="mt-6 rounded-xl border border-sage-200 bg-sage-50 p-4 text-sm text-sage-800">
          If an account exists for that email, a reset link has been sent.
        </div>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </div>
  );
}
