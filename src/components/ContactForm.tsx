import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/actions/contact";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state?.success) {
    return (
      <div className="rounded-3xl border border-sage-200 bg-sage-50 p-6 text-sage-800">
        Thanks for reaching out! We usually reply within 1 business day.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required minLength={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} rows={5} />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
