import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddressRow } from "@/components/AddressRow";
import { AddressForm } from "@/components/AddressForm";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Addresses</h1>

      <div className="mt-8 flex flex-col gap-4">
        {addresses.map((a) => (
          <AddressRow key={a.id} address={a} />
        ))}
      </div>

      <div className="mt-6">
        <AddressForm />
      </div>
    </div>
  );
}
