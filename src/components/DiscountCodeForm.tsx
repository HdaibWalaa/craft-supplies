import { useActionState, useEffect, useRef, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { applyDiscountCode, removeDiscountCode } from "@/actions/discount";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LocaleProvider";

type State = { error?: string; success?: boolean; code?: string; amount?: number };
const initialState: State = {};

export function DiscountCodeForm({ appliedCode }: { appliedCode: string | null }) {
  const [state, formAction, pending] = useActionState<State, FormData>(applyDiscountCode, initialState);
  const [removing, startRemove] = useTransition();
  const refreshedFor = useRef<string | undefined>(undefined);
  const { t } = useI18n();

  useEffect(() => {
    if (state?.success && refreshedFor.current !== state.code) {
      refreshedFor.current = state.code;
      window.dispatchEvent(new Event("storefront:refresh"));
    }
  }, [state]);

  const active = state?.success ? state.code : appliedCode;

  if (active) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-sage-50 px-3.5 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 text-sage-800">
          <Tag className="h-4 w-4" /> {t("codeApplied", { code: active })}
        </span>
        <button
          type="button"
          disabled={removing}
          onClick={() =>
            startRemove(async () => {
              await removeDiscountCode();
              window.dispatchEvent(new Event("storefront:refresh"));
            })
          }
          className="cursor-pointer text-sage-700 hover:text-sage-900"
          aria-label={t("removeDiscount")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex gap-2">
      <Input name="code" placeholder={t("promoCode")} className="flex-1" dir="ltr" />
      <Button type="submit" variant="outline" size="md" disabled={pending}>
        {pending ? t("applying") : t("apply")}
      </Button>
      {state?.error ? <p className="mt-1 w-full text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
