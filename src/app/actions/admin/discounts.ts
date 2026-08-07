"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

const schema = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().min(0),
  minSubtotal: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().min(1).optional(),
  active: z.boolean().default(true),
});

export type DiscountFormState = { error?: string };

export async function saveDiscount(_prev: DiscountFormState, formData: FormData): Promise<DiscountFormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minSubtotal: formData.get("minSubtotal") || 0,
    usageLimit: formData.get("usageLimit") || undefined,
    active: true,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the discount fields." };
  }
  const data = parsed.data;

  try {
    await prisma.discountCode.upsert({
      where: { code: data.code.toUpperCase() },
      update: { type: data.type, value: data.value, minSubtotal: data.minSubtotal, usageLimit: data.usageLimit },
      create: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minSubtotal: data.minSubtotal,
        usageLimit: data.usageLimit,
      },
    });
  } catch {
    return { error: "Could not save that discount code." };
  }

  revalidatePath("/admin/discounts");
  return {};
}

export async function toggleDiscountActive(id: string) {
  await requireAdmin();
  const discount = await prisma.discountCode.findUnique({ where: { id } });
  if (!discount) return { error: "Not found." };
  await prisma.discountCode.update({ where: { id }, data: { active: !discount.active } });
  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.discountCode.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/discounts");
  return { success: true };
}
