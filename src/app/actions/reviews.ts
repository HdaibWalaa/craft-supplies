"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const schema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  authorName: z.string().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5).max(1000),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export type ReviewFormState = { error?: string; success?: boolean };

export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    comment: formData.get("comment"),
    photoUrl: formData.get("photoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your review and try again." };
  }

  const session = await auth();
  const { productId, productSlug, ...data } = parsed.data;

  await prisma.review.create({
    data: {
      productId,
      userId: session?.user?.id,
      authorName: data.authorName,
      rating: data.rating,
      title: data.title || undefined,
      comment: data.comment,
      photoUrl: data.photoUrl || undefined,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}
