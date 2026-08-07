"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBlogPost, type BlogInput } from "@/app/actions/admin/blog";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function AdminBlogForm({
  coverThemes,
  products,
  initial,
}: {
  coverThemes: string[];
  products: { id: string; name: string }[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageTheme: string;
    published: boolean;
    relatedProductIds: string[];
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImageTheme, setCoverImageTheme] = useState(initial?.coverImageTheme ?? coverThemes[0]);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initial?.relatedProductIds ?? []);

  function toggleProduct(id: string) {
    setRelatedProductIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: BlogInput = {
      id: initial?.id,
      title,
      slug,
      excerpt,
      content,
      coverImageTheme,
      published,
      relatedProductIds,
    };
    startTransition(async () => {
      const res = await saveBlogPost(input);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/admin/blog");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">
      <section className="grid gap-4 rounded-3xl border border-ink-200/70 bg-cream-50 p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cover Theme</Label>
          <Select value={coverImageTheme} onValueChange={setCoverImageTheme}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {coverThemes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-terracotta-600" />
          Published
        </label>
      </section>

      <section className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
        <h2 className="font-display text-lg font-semibold text-ink-900">Related Products</h2>
        <p className="text-xs text-ink-400">Cross-sell supplies used in this tutorial.</p>
        <div className="mt-3 grid max-h-64 gap-1.5 overflow-y-auto sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-cream-100">
              <input
                type="checkbox"
                checked={relatedProductIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="h-4 w-4 rounded border-ink-300 text-terracotta-600"
              />
              {p.name}
            </label>
          ))}
        </div>
      </section>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-200 bg-cream-50 px-6 py-4 sm:left-64">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : initial ? "Save Changes" : "Publish Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
