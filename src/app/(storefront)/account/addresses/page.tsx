import type { Metadata } from "next";
import { auth } from "@/auth";
import { fetchAddresses } from "@/lib/api/addresses";
import { AddressRow } from "@/components/AddressRow";
import { AddressForm } from "@/components/AddressForm";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = session ? await fetchAddresses() : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Addresses</h1>

      <div className="mt-8 flex flex-col gap-4">
        {addresses.map((a) => (
          <AddressRow key={a.id} address={{ id: String(a.id), fullName: `${a.first_name} ${a.last_name}`, line1: a.line_1, line2: a.line_2, city: a.city, state: a.region ?? "", postalCode: a.postal_code ?? "", country: a.country_code, isDefault: a.is_default_shipping }} />
        ))}
      </div>

      <div className="mt-6">
        <AddressForm />
      </div>
    </div>
  );
}
