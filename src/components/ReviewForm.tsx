"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/app/actions/reviews";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

const initialState: ReviewFormState = {};

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);
  const { t } = useI18n();

  if (state?.success) {
    return (
      <div className="rounded-3xl border border-sage-200 bg-sage-50 p-5 text-sm text-sage-800">
        {t("reviewThanks")}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-3xl border border-ink-200/70 p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <Label>{t("yourRating")}</Label>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={t("ratingStars", { count: n })}
              onClick={() => setRating(n)}
              className="cursor-pointer p-0.5"
            >
              <Star className={cn("h-6 w-6", n <= rating ? "fill-terracotta-500 text-terracotta-500" : "text-ink-200")} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="authorName">{t("yourName")}</Label>
          <Input id="authorName" name="authorName" required minLength={2} placeholder={t("namePlaceholder")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">{t("reviewTitleOptional")}</Label>
          <Input id="title" name="title" placeholder={t("reviewTitlePlaceholder")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">{t("review")}</Label>
        <Textarea id="comment" name="comment" required minLength={5} rows={4} placeholder={t("reviewPlaceholder")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="photoUrl">{t("photoUrlOptional")}</Label>
        <Input id="photoUrl" name="photoUrl" type="url" placeholder="https://..." />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("submittingReview") : t("submitReview")}
      </Button>
    </form>
  );
}
