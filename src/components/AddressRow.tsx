"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/app/actions/addresses";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type AddressData = {
  id: string;
  fullName: string;
  phone: string;
  governorate: string;
  address: string;
  isDefault: boolean;
};

export function AddressRow({ address }: { address: AddressData }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-start justify-between gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
      <div>
        {address.isDefault ? <Badge variant="sage" className="mb-2">Default</Badge> : null}
        <p className="font-medium text-ink-900">{address.fullName}</p>
        <p className="text-sm text-ink-500">
          {address.phone}
        </p>
        <p className="text-sm text-ink-500">
          {address.governorate} — {address.address}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {!address.isDefault ? (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setDefaultAddress(address.id);
                router.refresh();
              })
            }
            className={cn("flex cursor-pointer items-center gap-1 text-xs text-ink-500 hover:text-terracotta-700")}
          >
            <Star className="h-3.5 w-3.5" /> Set default
          </button>
        ) : null}
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteAddress(address.id);
              router.refresh();
            })
          }
          className="flex cursor-pointer items-center gap-1 text-xs text-ink-500 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
