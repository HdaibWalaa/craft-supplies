"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

const STATUS_VALUES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

export async function updateOrderStatus(orderId: string, status: (typeof STATUS_VALUES)[number]) {
  await requireAdmin();
  const parsed = z.enum(STATUS_VALUES).safeParse(status);
  if (!parsed.success) return { error: "Invalid status." };

  const order = await prisma.order.update({ where: { id: orderId }, data: { status: parsed.data } });

  const recipient = order.guestEmail ?? (await prisma.user.findUnique({ where: { id: order.userId ?? "" } }))?.email;
  if (recipient) {
    await sendEmail({
      to: recipient,
      subject: `Order ${order.orderNumber} update: ${parsed.data}`,
      text: `Your order ${order.orderNumber} status is now: ${parsed.data}.`,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}
