"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function setHeroProduct(productId: string) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroProductId: productId || null },
    create: { id: "singleton", heroProductId: productId || null },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return { success: true };
}
