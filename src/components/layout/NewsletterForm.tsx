"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: NewsletterState = {};

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  if (state?.success) {
    return (
      <p className="text-sm text-sage-300">
        Thanks for subscribing! Use code <strong>WELCOME10</strong> for 10% off your first order.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="border-cream-100/20 bg-walnut-800 text-cream-50 placeholder:text-cream-300/60 sm:max-w-64"
      />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Subscribing..." : "Get 10% Off"}
      </Button>
      {state?.error ? <p className="text-sm text-terracotta-300 sm:hidden">{state.error}</p> : null}
    </form>
  );
}
