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
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { Skill } from "@/types/database";

const PRESET_ICONS: Array<{ label: string; url: string; color: string }> = [
  { label: "TypeScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg", color: "#3178c6" },
  { label: "JavaScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", color: "#f0db4f" },
  { label: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", color: "#61dafb" },
  { label: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg", color: "#ffffff" },
  { label: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg", color: "#38bdf8" },
  { label: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg", color: "#6cc24a" },
  { label: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", color: "#3776ab" },
  { label: "Go", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg", color: "#00add8" },
  { label: "Rust", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg", color: "#dea584" },
  { label: "PostgreSQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg", color: "#336791" },
  { label: "Supabase", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg", color: "#3ecf8e" },
  { label: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg", color: "#2496ed" },
  { label: "AWS", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg", color: "#ff9900" },
  { label: "GraphQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/graphql/graphql-plain.svg", color: "#e535ab" },
];

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  short_description: "",
  icon: "",
  color: "#38bdf8",
  category: "Frontend",
  shortcut: "",
  visible: true,
};

function SortableSkillRow({
  skill,
  onEdit,
  onToggleVisible,
  onDelete,
}: {
  skill: Skill;
  onEdit: (s: Skill) => void;
  onToggleVisible: (s: Skill) => void;
  onDelete: (s: Skill) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: skill.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>

        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60"
          style={{ backgroundColor: `${skill.color}22` }}
        >
          {skill.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={skill.icon} alt="" className="size-5 object-contain" />
          ) : (
            <span className="text-xs font-bold">{skill.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{skill.name}</span>
            <span
              className="size-2.5 rounded-full shrink-0 border border-border"
              style={{ backgroundColor: skill.color }}
            />
            <Badge variant="secondary" className="text-[10px]">
              {skill.category}
            </Badge>
            {!skill.visible && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Hidden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-md">
            {skill.short_description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisible(skill)}
          title={skill.visible ? "Hide skill" : "Show skill"}
        >
          {skill.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(skill)}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(skill)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const loadSkills = async () => {
    const res = await fetch("/api/admin/skills");
    const json = (await res.json()) as { data?: Skill[] };
    setSkills(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/skills")
      .then((r) => r.json())
      .then((json: { data?: Skill[] }) => {
        if (!active) return;
        setSkills(json.data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (s: Skill) => {
    setForm({
      id: s.id,
      name: s.name,
      slug: s.slug,
      short_description: s.short_description,
      icon: s.icon,
      color: s.color,
      category: s.category,
      shortcut: s.shortcut || "",
      visible: s.visible,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Skill name is required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch("/api/admin/skills", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: form.id } : {}),
          name: form.name,
          slug: form.slug || undefined,
          short_description: form.short_description,
          icon: form.icon,
          color: form.color,
          category: form.category,
          shortcut: form.shortcut || null,
          visible: form.visible,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success(isEdit ? "Skill updated" : "Skill added");
      setDialogOpen(false);
      await loadSkills();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (s: Skill) => {
    const res = await fetch("/api/admin/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, visible: !s.visible }),
    });
    if (res.ok) {
      setSkills((prev) => prev.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)));
      toast.success(s.visible ? "Skill hidden" : "Skill visible");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/skills?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setSkills((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success("Skill deleted");
    }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(skills, oldIndex, newIndex);
    setSkills(reordered);

    await fetch("/api/admin/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: reordered.map((s, idx) => ({ id: s.id, sort_order: idx })),
      }),
    });
    toast.success("Order saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Skills &amp; 3D Keyboard Keys</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder keys. Visible skills automatically populate your 3D keyboard &amp; 2D
            fallback grid.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" /> Add Skill
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No skills yet. Click &ldquo;Add Skill&rdquo; to populate your 3D keyboard.
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {skills.map((skill) => (
                <SortableSkillRow
                  key={skill.id}
                  skill={skill}
                  onEdit={openEdit}
                  onToggleVisible={handleToggleVisible}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Skill" : "Add Skill"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="TypeScript"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Frontend / Backend / DevOps"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short Description (shown in 3D keyboard HUD)</Label>
              <Input
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="Type-safe JavaScript at scale"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Keycap Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-10 w-12 rounded border border-input bg-background p-1 cursor-pointer"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Physical Key Shortcut (optional)</Label>
                <Input
                  value={form.shortcut}
                  onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                  placeholder="e.g. KeyQ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon URL or Upload SVG/PNG</Label>
              <div className="flex gap-2">
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="https://cdn.jsdelivr.net/..."
                />
                <MediaUploader
                  folder="skills"
                  accept="image/*"
                  label="Upload"
                  onUploaded={(url) => setForm({ ...form, icon: url })}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_ICONS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        icon: preset.url,
                        color: preset.color,
                        name: form.name || preset.label,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-accent cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt="" className="size-3.5" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label>Visible on Public Site</Label>
              <Switch
                checked={form.visible}
                onCheckedChange={(checked) => setForm({ ...form, visible: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Skill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This removes the skill from both your 3D keyboard and 2D Tech Stack grid."
        onConfirm={handleDelete}
      />
    </div>
  );
}
