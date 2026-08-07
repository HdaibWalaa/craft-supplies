"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveDiscount, type DiscountFormState } from "@/app/actions/admin/discounts";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const initialState: DiscountFormState = {};

export function DiscountForm() {
  const [state, formAction, pending] = useActionState(saveDiscount, initialState);
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        router.refresh();
      }}
      className="grid gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" required placeholder="SUMMER20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Type</Label>
        <Select name="type" defaultValue="PERCENT">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENT">Percent Off</SelectItem>
            <SelectItem value="FIXED">Fixed Amount Off</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" type="number" min={0} step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minSubtotal">Min Subtotal ($)</Label>
        <Input id="minSubtotal" name="minSubtotal" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
        <Input id="usageLimit" name="usageLimit" type="number" min={1} />
      </div>
      {state?.error ? <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{state.error}</p> : null}
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Add / Update Code"}
        </Button>
      </div>
    </form>
  );
}
