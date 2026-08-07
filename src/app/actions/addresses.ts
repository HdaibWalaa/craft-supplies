"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const schema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().optional(),
});

export type AddressFormState = { error?: string };

export async function addAddress(_prev: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };

  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "US",
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the address fields." };
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });
  await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id, isDefault: existingCount === 0 },
  });

  revalidatePath("/account/addresses");
  return {};
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };
  await prisma.address.deleteMany({ where: { id: addressId, userId: session.user.id } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };
  await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  await prisma.address.updateMany({
    where: { id: addressId, userId: session.user.id },
    data: { isDefault: true },
  });
  revalidatePath("/account/addresses");
  return { success: true };
}
