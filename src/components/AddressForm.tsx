"use client";

import { useActionState, useState } from "react";
import { addAddress, type AddressFormState } from "@/app/actions/addresses";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import type { ApiGovernorate } from "@/lib/api/shipping";
import { useI18n } from "@/components/i18n/LocaleProvider";

const initialState: AddressFormState = {};

export function AddressForm({ governorates }: { governorates: ApiGovernorate[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addAddress, initialState);
  const { t } = useI18n();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add New Address
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-4 rounded-3xl border border-ink-200/70 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="full_name" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="phone">{t("phoneNumber")}</Label>
          <Input id="phone" name="phone" type="tel" required dir="ltr" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="governorate">{t("governorate")}</Label>
          <Select name="governorate" required><SelectTrigger id="governorate"><SelectValue placeholder={t("selectGovernorate")} /></SelectTrigger><SelectContent>{governorates.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">{t("address")}</Label>
          <textarea id="address" name="address" required rows={3} className="w-full rounded-lg border border-ink-300 bg-cream-50 px-3.5 py-3 text-sm text-ink-900" />
        </div>
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Address"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
