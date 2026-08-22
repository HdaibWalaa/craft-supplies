import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/actions/contact";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LocaleProvider";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const { locale, t } = useI18n();
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (state?.success) {
    return (
      <div dir={direction} className="rounded-3xl border border-sage-200 bg-sage-50 p-6 text-start text-sage-800">
        {t("contactSuccess")}
      </div>
    );
  }

  return (
    <form action={formAction} dir={direction} className="flex flex-col gap-4 text-start">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("contactNameLabel")}</Label>
        <Input id="name" name="name" dir={direction} className="text-start" required minLength={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("contactEmailLabel")}</Label>
        <Input id="email" name="email" type="email" dir={direction} className="text-start" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">{t("contactMessageLabel")}</Label>
        <Textarea id="message" name="message" dir={direction} className="text-start" required minLength={10} rows={5} />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{t("contactFormError")}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("contactSending") : t("contactSend")}
      </Button>
    </form>
  );
}
