import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteBlogPost } from "@/app/actions/admin/blog";

export const metadata: Metadata = { title: "Blog Posts" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200/70 bg-cream-50">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-cream-100">
                <td className="px-4 py-3 font-medium text-ink-900">
                  <Link href={`/admin/blog/${p.id}`} className="hover:text-terracotta-700">{p.title}</Link>
                </td>
                <td className="px-4 py-3 text-ink-500">{new Date(p.publishedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.published ? "sage" : "ink"}>{p.published ? "Published" : "Draft"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/blog/${p.id}`} className="text-sm text-terracotta-700 hover:underline">
                      Edit
                    </Link>
                    <ConfirmDeleteButton action={deleteBlogPost} id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 ? <p className="p-8 text-center text-ink-400">No blog posts yet.</p> : null}
      </div>
    </div>
  );
}
