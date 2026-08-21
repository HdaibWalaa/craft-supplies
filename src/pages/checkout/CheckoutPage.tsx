import type { Metadata } from "@/types/metadata";
import { Navigate } from "react-router-dom";
import { getCart, getCartTotals } from "@/lib/cart";
import { getAppliedDiscountCode } from "@/actions/discount";
import { validateDiscountCode } from "@/lib/discount";
import { auth } from "@/auth";
import { fetchAddresses } from "@/lib/api/addresses";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getTranslations } from "@/lib/i18n/server";
import { fetchJordanGovernorates } from "@/lib/api/shipping";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, session, { t }, governorates] = await Promise.all([
    getCart(), auth(), getTranslations(), fetchJordanGovernorates(),
  ]);

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const { subtotal, itemCount } = getCartTotals(cart);
  const appliedCode = await getAppliedDiscountCode();

  let discountAmount = 0;
  if (appliedCode) {
    const result = await validateDiscountCode(appliedCode, subtotal);
    if (result.valid) discountAmount = result.amount;
  }

  let defaultAddress = null;
  if (session?.user) {
    const address = (await fetchAddresses()).sort((a, b) => Number(b.is_default_shipping) - Number(a.is_default_shipping))[0];
    defaultAddress = address ? {
      fullName: address.full_name ?? `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim(),
      phone: address.phone ?? "", governorate: address.governorate ?? "", address: address.address ?? address.line_1 ?? "",
    } : null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink-900">{t("checkout")}</h1>
      <CheckoutForm
        defaultAddress={defaultAddress}
        isLoggedIn={!!session?.user}
        governorates={governorates}
        subtotal={subtotal}
        discountAmount={discountAmount}
        discountCode={discountAmount > 0 ? appliedCode : null}
        itemCount={itemCount}
      />
    </div>
  );
}
