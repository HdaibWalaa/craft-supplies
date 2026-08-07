"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function ConfirmDeleteButton({
  action,
  id,
  label = "Delete",
  confirmMessage = "Are you sure? This can't be undone.",
}: {
  action: (id: string) => Promise<unknown>;
  id: string;
  label?: string;
  confirmMessage?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="text-ink-500">{confirmMessage}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await action(id);
              router.refresh();
            })
          }
          className="cursor-pointer font-medium text-red-600 hover:underline"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="cursor-pointer text-ink-500 hover:underline">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex cursor-pointer items-center gap-1 text-sm text-ink-500 hover:text-red-600"
    >
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
