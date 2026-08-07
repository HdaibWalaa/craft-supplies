"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.string().email();

export type NewsletterState = { error?: string; success?: boolean };

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = formData.get("email");
  const parsed = schema.safeParse(email);
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: { email: parsed.data },
  });

  return { success: true };
}
