"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, type CategoryFormState } from "@/app/actions/admin/categories";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const initialState: CategoryFormState = {};

export function CategoryForm({
  themes,
  initial,
}: {
  themes: string[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    colorTheme: string;
    sortOrder: number;
  };
}) {
  const [state, formAction, pending] = useActionState(saveCategory, initialState);
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        router.refresh();
      }}
      className="grid gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-5 sm:grid-cols-2"
    >
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" name="slug" defaultValue={initial?.slug} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} defaultValue={initial?.description ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Theme</Label>
        <Select name="colorTheme" defaultValue={initial?.colorTheme ?? themes[0]}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
      </div>
      {state?.error ? <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initial ? "Save Changes" : "Add Category"}
        </Button>
      </div>
    </form>
  );
}
