"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function QuickAddButton({
  variantId,
  disabled,
  className,
  size = "sm",
  label = "Add to Cart",
}: {
  variantId: string;
  disabled?: boolean;
  className?: string;
  size?: ButtonProps["size"];
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const res = await addToCart(variantId, 1);
      if (res.error) {
        setState("error");
      } else {
        setState("added");
        router.refresh();
      }
      setTimeout(() => setState("idle"), 1800);
    });
  }

  return (
    <Button
      type="button"
      size={size}
      variant={state === "error" ? "outline" : "primary"}
      disabled={disabled || pending}
      onClick={handleClick}
      className={cn("whitespace-nowrap", className)}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "added" ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingBag className="h-4 w-4" />
      )}
      {state === "added" ? "Added" : state === "error" ? "Unavailable" : label}
    </Button>
  );
}
