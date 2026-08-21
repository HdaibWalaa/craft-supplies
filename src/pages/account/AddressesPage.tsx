import type { Metadata } from "@/types/metadata";
import { auth } from "@/auth";
import { fetchAddresses } from "@/lib/api/addresses";
import { AddressRow } from "@/components/AddressRow";
import { AddressForm } from "@/components/AddressForm";
import { fetchJordanGovernorates } from "@/lib/api/shipping";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  const [addresses, governorates] = await Promise.all([session ? fetchAddresses() : [], fetchJordanGovernorates()]);
  const governorateLabels = Object.fromEntries(governorates.map((item) => [item.code, item.label]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Addresses</h1>

      <div className="mt-8 flex flex-col gap-4">
        {addresses.map((a) => (
          <AddressRow key={a.id} address={{ id: String(a.id), fullName: a.full_name ?? `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(), phone: a.phone ?? "", governorate: governorateLabels[a.governorate ?? ""] ?? a.governorate ?? "", address: a.address ?? a.line_1 ?? "", isDefault: a.is_default_shipping }} />
        ))}
      </div>

      <div className="mt-6">
        <AddressForm governorates={governorates} />
      </div>
    </div>
  );
}
