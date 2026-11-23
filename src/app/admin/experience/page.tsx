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
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
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
import type { Experience } from "@/types/database";

const EMPTY_EXP = {
  id: "",
  role: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  bullets: [""],
  tech_tags_str: "",
  visible: true,
};

function SortableExperienceCard({
  exp,
  onEdit,
  onDelete,
}: {
  exp: Experience;
  onEdit: (e: Experience) => void;
  onDelete: (e: Experience) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exp.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sm md:text-base">{exp.role}</h3>
            {exp.is_current && <Badge className="bg-emerald-600 text-white text-[10px]">Current</Badge>}
            {!exp.visible && <Badge variant="outline">Hidden</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            {exp.company} {exp.location ? `· ${exp.location}` : ""} · {exp.start_date} –{" "}
            {exp.is_current ? "Present" : exp.end_date}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {exp.tech_tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onEdit(exp)}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(exp)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_EXP);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    const res = await fetch("/api/admin/experiences");
    const json = (await res.json()) as { data?: Experience[] };
    setItems(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/experiences")
      .then((r) => r.json())
      .then((json: { data?: Experience[] }) => {
        if (!active) return;
        setItems(json.data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_EXP);
    setDialogOpen(true);
  };

  const openEdit = (e: Experience) => {
    setForm({
      id: e.id,
      role: e.role,
      company: e.company,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date || "",
      is_current: e.is_current,
      bullets: e.bullets.length ? e.bullets : [""],
      tech_tags_str: e.tech_tags.join(", "),
      visible: e.visible,
    });
    setDialogOpen(true);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch("/api/admin/experiences", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: form.id } : {}),
          role: form.role,
          company: form.company,
          location: form.location,
          start_date: form.start_date,
          end_date: form.is_current ? null : form.end_date || null,
          is_current: form.is_current,
          bullets: form.bullets.map((b) => b.trim()).filter(Boolean),
          tech_tags: form.tech_tags_str
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          visible: form.visible,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success(isEdit ? "Experience updated" : "Experience added");
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/experiences?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success("Experience deleted");
    }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      items,
      items.findIndex((x) => x.id === active.id),
      items.findIndex((x) => x.id === over.id)
    );
    setItems(reordered);
    await fetch("/api/admin/experiences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: reordered.map((item, idx) => ({ id: item.id, sort_order: idx })),
      }),
    });
    toast.success("Timeline order saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Experience Timeline</h1>
          <p className="text-sm text-muted-foreground">Drag cards to control display order.</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" /> Add Role
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No experiences added yet.</Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((exp) => (
                <SortableExperienceCard
                  key={exp.id}
                  exp={exp}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role / Title</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote / City"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  placeholder="Jan 2025"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_current}
                  onCheckedChange={(checked) => setForm({ ...form, is_current: checked })}
                />
                <Label>Currently working here (shows live pulsing indicator)</Label>
              </div>
              {!form.is_current && (
                <Input
                  className="w-44"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  placeholder="End date (e.g. Dec 2024)"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Accomplishment Bullet Points</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ ...form, bullets: [...form.bullets, ""] })}
                >
                  <Plus className="size-3.5" /> Add Bullet
                </Button>
              </div>
              <div className="space-y-2">
                {form.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => {
                        const next = [...form.bullets];
                        next[idx] = e.target.value;
                        setForm({ ...form, bullets: next });
                      }}
                      placeholder={`Achievement #${idx + 1}`}
                    />
                    {form.bullets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setForm({ ...form, bullets: form.bullets.filter((_, i) => i !== idx) })
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tech Tags (comma-separated, matches Skills icons automatically)</Label>
              <Input
                value={form.tech_tags_str}
                onChange={(e) => setForm({ ...form, tech_tags_str: e.target.value })}
                placeholder="Next.js, TypeScript, PostgreSQL, Docker"
              />
            </div>

            <div className="flex items-center justify-between">
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
                {saving ? "Saving..." : "Save Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.role}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
