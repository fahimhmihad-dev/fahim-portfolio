"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Eye, GripVertical, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import MediaUploader from "@/components/admin/media-uploader";
import type { Project } from "@/types/database";
import { slugify } from "@/lib/utils";

const EMPTY_PROJECT = {
  id: "",
  title: "",
  slug: "",
  category: "Full Stack",
  tagline: "",
  description: "",
  cover_url: "",
  backdrop_url: "",
  gallery: [] as string[],
  tech_frontend_str: "",
  tech_backend_str: "",
  tech_tags_str: "",
  live_url: "",
  repo_url: "",
  featured: false,
  visible: true,
};

function SortableProjectRow({
  project,
  onEdit,
  onPreview,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onPreview: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3.5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="size-4" />
        </button>

        {project.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_url}
            alt=""
            className="h-12 w-18 shrink-0 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="h-12 w-18 shrink-0 rounded-md border border-border bg-muted" />
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm truncate">{project.title}</span>
            <Badge variant="secondary" className="text-[10px]">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="gap-1 bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">
                <Star className="size-2.5 fill-current" /> Featured
              </Badge>
            )}
            {!project.visible && <Badge variant="outline">Hidden</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
            {project.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onPreview(project)} title="Preview">
          <Eye className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(project)} title="Edit">
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(project)}
          className="text-destructive hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [galleryInput, setGalleryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    const res = await fetch("/api/admin/projects");
    const json = (await res.json()) as { data?: Project[] };
    setProjects(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((json: { data?: Project[] }) => {
        if (!active) return;
        setProjects(json.data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_PROJECT);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      cover_url: p.cover_url,
      backdrop_url: p.backdrop_url || "",
      gallery: p.gallery || [],
      tech_frontend_str: (p.tech_frontend || []).join(", "),
      tech_backend_str: (p.tech_backend || []).join(", "),
      tech_tags_str: (p.tech_tags || []).join(", "),
      live_url: p.live_url || "",
      repo_url: p.repo_url || "",
      featured: p.featured,
      visible: p.visible,
    });
    setDialogOpen(true);
  };

  const parseCsv = (str: string) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch("/api/admin/projects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: form.id } : {}),
          title: form.title,
          slug: form.slug || slugify(form.title),
          category: form.category,
          tagline: form.tagline,
          description: form.description,
          cover_url: form.cover_url,
          backdrop_url: form.backdrop_url || null,
          gallery: form.gallery,
          tech_frontend: parseCsv(form.tech_frontend_str),
          tech_backend: parseCsv(form.tech_backend_str),
          tech_tags: parseCsv(form.tech_tags_str),
          live_url: form.live_url || null,
          repo_url: form.repo_url || null,
          featured: form.featured,
          visible: form.visible,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success(isEdit ? "Project updated" : "Project created");
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/projects?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success("Project deleted");
    }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      projects,
      projects.findIndex((p) => p.id === active.id),
      projects.findIndex((p) => p.id === over.id)
    );
    setProjects(reordered);
    await fetch("/api/admin/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: reordered.map((p, idx) => ({ id: p.id, sort_order: idx })),
      }),
    });
    toast.success("Project order saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder cards. Supports hover scroll-preview covers, multi-image galleries, and
            Markdown descriptions.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No projects yet.</Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {projects.map((project) => (
                <SortableProjectRow
                  key={project.id}
                  project={project}
                  onEdit={openEdit}
                  onPreview={setPreviewTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Full Stack SaaS"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Short one-line pitch"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Live URL</Label>
                <Input
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Repository URL</Label>
                <Input
                  value={form.repo_url}
                  onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Screenshot URL</Label>
              <div className="flex gap-2">
                <Input
                  value={form.cover_url}
                  onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                  placeholder="Upload or paste image URL"
                />
                <MediaUploader
                  folder="projects"
                  accept="image/*"
                  label="Upload Cover"
                  onUploaded={(url) => setForm({ ...form, cover_url: url })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Card Wallpaper / Backdrop URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.backdrop_url}
                  onChange={(e) => setForm({ ...form, backdrop_url: e.target.value })}
                  placeholder="Optional gradient/wallpaper behind cover"
                />
                <MediaUploader
                  folder="projects"
                  accept="image/*"
                  label="Upload BG"
                  onUploaded={(url) => setForm({ ...form, backdrop_url: url })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Screenshots ({form.gallery.length})</Label>
              <div className="flex gap-2">
                <Input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="Paste image URL and click Add"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!galleryInput.trim()) return;
                    setForm({ ...form, gallery: [...form.gallery, galleryInput.trim()] });
                    setGalleryInput("");
                  }}
                >
                  Add URL
                </Button>
                <MediaUploader
                  folder="projects"
                  accept="image/*"
                  label="Upload"
                  onUploaded={(url) => setForm({ ...form, gallery: [...form.gallery, url] })}
                />
              </div>
              {form.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.gallery.map((img, i) => (
                    <div
                      key={`${img}-${i}`}
                      className="relative group rounded-md overflow-hidden border border-border w-24 h-16"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, gallery: form.gallery.filter((_, idx) => idx !== i) })
                        }
                        className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-0.5 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Frontend Tech (comma-separated)</Label>
                <Input
                  value={form.tech_frontend_str}
                  onChange={(e) => setForm({ ...form, tech_frontend_str: e.target.value })}
                  placeholder="Next.js, TypeScript, Tailwind CSS"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Backend Tech (comma-separated)</Label>
                <Input
                  value={form.tech_backend_str}
                  onChange={(e) => setForm({ ...form, tech_backend_str: e.target.value })}
                  placeholder="Supabase, PostgreSQL, Docker"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Detailed Description (Markdown supported)</Label>
              <Textarea
                rows={7}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="### Overview&#10;&#10;Explain the architecture, challenges, and results..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={form.visible}
                  onCheckedChange={(checked) => setForm({ ...form, visible: checked })}
                />
                <Label>Visible on Public Site</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={Boolean(previewTarget)} onOpenChange={(o) => !o && setPreviewTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTarget?.title}</DialogTitle>
          </DialogHeader>
          {previewTarget && (
            <div className="space-y-4">
              {previewTarget.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewTarget.cover_url}
                  alt={previewTarget.title}
                  className="w-full rounded-lg border border-border"
                />
              )}
              <p className="text-sm text-muted-foreground">{previewTarget.tagline}</p>
              <div className="text-sm space-y-2 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {previewTarget.description}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
