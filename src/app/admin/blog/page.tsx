"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import MediaUploader from "@/components/admin/media-uploader";
import type { BlogPost } from "@/types/database";
import { formatDateShort, slugify } from "@/lib/utils";

const EMPTY_POST = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover_url: "",
  author: "Fahim H. Mihad",
  tags_str: "",
  status: "draft" as "draft" | "published",
  seo_title: "",
  seo_description: "",
  seo_og_image: "",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/blog");
    const json = (await res.json()) as { data?: BlogPost[] };
    setPosts(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((json: { data?: BlogPost[] }) => {
        if (!active) return;
        setPosts(json.data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_POST);
    setEditing(true);
  };

  const openEdit = (p: BlogPost) => {
    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      content: p.content,
      cover_url: p.cover_url || "",
      author: p.author || "Fahim H. Mihad",
      tags_str: (p.tags || []).join(", "),
      status: p.status,
      seo_title: p.seo_title || "",
      seo_description: p.seo_description || "",
      seo_og_image: p.seo_og_image || "",
    });
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Post title is required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: form.id } : {}),
          title: form.title,
          slug: form.slug || slugify(form.title),
          summary: form.summary,
          content: form.content,
          cover_url: form.cover_url || null,
          author: form.author,
          tags: form.tags_str
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: form.status,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          seo_og_image: form.seo_og_image || null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to save post");
      toast.success(form.status === "published" ? "Post published!" : "Draft saved!");
      setEditing(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/blog?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Post deleted");
    }
    setDeleteTarget(null);
  };

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="gap-2">
            <ArrowLeft className="size-4" /> Back to Posts
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="size-4" />
              {saving ? "Saving..." : form.status === "published" ? "Publish" : "Save Draft"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: form.id ? form.slug : slugify(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-article-slug"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Summary</Label>
            <Input
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Brief teaser displayed on /blogs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={form.tags_str}
              onChange={(e) => setForm({ ...form, tags_str: e.target.value })}
              placeholder="nextjs, engineering, design"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cover Image</Label>
            <div className="flex gap-2">
              <Input
                value={form.cover_url}
                onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                placeholder="https://..."
              />
              <MediaUploader
                folder="blog"
                accept="image/*"
                label="Upload"
                onUploaded={(url) => setForm({ ...form, cover_url: url })}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="split">
          <div className="flex items-center justify-between">
            <Label>Content (Markdown)</Label>
            <TabsList>
              <TabsTrigger value="split">Split View</TabsTrigger>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="split" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Textarea
              rows={18}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your article in Markdown..."
              className="font-mono text-sm"
            />
            <div className="rounded-md border border-border bg-card p-5 overflow-y-auto max-h-[450px] space-y-4 text-sm leading-relaxed [&_h1]:font-display [&_h1]:text-xl [&_h2]:font-display [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-orange-400 [&_blockquote]:pl-4 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {form.content || "*Live Markdown preview appears here...*"}
              </ReactMarkdown>
            </div>
          </TabsContent>

          <TabsContent value="write">
            <Textarea
              rows={20}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="preview">
            <div className="rounded-md border border-border bg-card p-6 min-h-[380px] space-y-4 text-sm leading-relaxed [&_h1]:font-display [&_h1]:text-2xl [&_h2]:font-display [&_h2]:text-xl [&_ul]:list-disc [&_ul]:pl-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">SEO Overrides (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Custom SEO Title"
              value={form.seo_title}
              onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
            />
            <Input
              placeholder="Custom SEO Description"
              value={form.seo_description}
              onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
            />
          </div>
        </Card>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            Write Markdown articles with live preview and instant publishing.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No blog posts yet.</Card>
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm md:text-base">{post.title}</span>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  /blogs/{post.slug} · {formatDateShort(post.published_at || post.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {post.status === "published" && (
                  <Button asChild variant="ghost" size="icon">
                    <a href={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(post)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
