"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImageTheme: z.string().min(1),
  published: z.boolean().default(true),
  relatedProductIds: z.array(z.string()).default([]),
});

export type BlogInput = z.infer<typeof schema>;
export type BlogActionResult = { error?: string; postId?: string };

export async function saveBlogPost(input: BlogInput): Promise<BlogActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the post fields." };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

  try {
    const post = data.id
      ? await prisma.blogPost.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug,
            excerpt: data.excerpt,
            content: data.content,
            coverImageTheme: data.coverImageTheme,
            published: data.published,
          },
        })
      : await prisma.blogPost.create({
          data: {
            title: data.title,
            slug,
            excerpt: data.excerpt,
            content: data.content,
            coverImageTheme: data.coverImageTheme,
            published: data.published,
          },
        });

    await prisma.blogPostProduct.deleteMany({ where: { blogPostId: post.id } });
    for (const productId of data.relatedProductIds) {
      await prisma.blogPostProduct.create({ data: { blogPostId: post.id, productId } });
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return { postId: post.id };
  } catch {
    return { error: "A post with that slug already exists." };
  }
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/blog");
  return { success: true };
}
