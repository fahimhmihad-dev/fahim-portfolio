"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import MediaUploader from "@/components/admin/media-uploader";
import type { SiteSettings } from "@/types/database";
import { DEFAULT_SITE_SETTINGS } from "@/lib/defaults";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ data }: { data: SiteSettings | null }) => {
        if (data) setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success("Site settings saved & published!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Site Settings</h1>
          <p className="text-sm text-muted-foreground">
            Control section visibility, visual effects, navigation links, SEO defaults, analytics,
            and maintenance mode.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Settings
        </Button>
      </div>

      {/* Section Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section &amp; Feature Visibility</CardTitle>
          <CardDescription>Toggle portfolio sections and interactive visual layers.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(settings.sections) as Array<keyof SiteSettings["sections"]>).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <Label className="capitalize">{key}</Label>
              <Switch
                checked={settings.sections[key]}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    sections: { ...settings.sections, [key]: checked },
                  })
                }
              />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label>3D Keyboard</Label>
            <Switch
              checked={settings.enable_3d_keyboard}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_3d_keyboard: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label>Space Particles</Label>
            <Switch
              checked={settings.enable_particles}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_particles: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label>Elastic Cursor</Label>
            <Switch
              checked={settings.enable_elastic_cursor}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_elastic_cursor: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Navigation Drawer Links</CardTitle>
            <CardDescription>Links shown in the animated top-drop menu.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSettings({
                ...settings,
                nav_links: [...settings.nav_links, { title: "New Link", href: "/", visible: true }],
              })
            }
          >
            <Plus className="size-3.5" /> Add Link
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {settings.nav_links.map((link, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <Input
                className="sm:col-span-3"
                value={link.title}
                onChange={(e) => {
                  const next = [...settings.nav_links];
                  next[idx] = { ...next[idx], title: e.target.value };
                  setSettings({ ...settings, nav_links: next });
                }}
                placeholder="Label"
              />
              <Input
                className="sm:col-span-4"
                value={link.href}
                onChange={(e) => {
                  const next = [...settings.nav_links];
                  next[idx] = { ...next[idx], href: e.target.value };
                  setSettings({ ...settings, nav_links: next });
                }}
                placeholder="/#projects"
              />
              <Input
                className="sm:col-span-4"
                value={link.thumbnail || ""}
                onChange={(e) => {
                  const next = [...settings.nav_links];
                  next[idx] = { ...next[idx], thumbnail: e.target.value };
                  setSettings({ ...settings, nav_links: next });
                }}
                placeholder="Preview image URL"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sm:col-span-1 text-destructive"
                onClick={() =>
                  setSettings({
                    ...settings,
                    nav_links: settings.nav_links.filter((_, i) => i !== idx),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Appearance, Footer & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Theme &amp; Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default Theme</Label>
              <select
                value={settings.default_theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_theme: e.target.value as "dark" | "light" | "system",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="dark">Dark (Midnight Space)</option>
                <option value="light">Light</option>
                <option value="system">Follow System</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Footer Copyright Text</Label>
              <Input
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Mode</CardTitle>
            <CardDescription>
              Displays a maintenance banner on all public pages while `/admin` stays accessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Maintenance Mode</Label>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Maintenance Message</Label>
              <Textarea
                rows={3}
                value={settings.maintenance_message}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO Defaults &amp; Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Default SEO Title</Label>
            <Input
              value={settings.seo_default_title}
              onChange={(e) => setSettings({ ...settings, seo_default_title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Google Analytics Measurement ID (G-...)</Label>
            <Input
              value={settings.analytics_ga_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, analytics_ga_id: e.target.value || null })
              }
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Default SEO Description</Label>
            <Textarea
              rows={2}
              value={settings.seo_default_description}
              onChange={(e) =>
                setSettings({ ...settings, seo_default_description: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Default OG Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={settings.seo_default_og_image || ""}
                onChange={(e) =>
                  setSettings({ ...settings, seo_default_og_image: e.target.value || null })
                }
                placeholder="Optional custom OG image"
              />
              <MediaUploader
                folder="seo"
                accept="image/*"
                label="Upload OG"
                onUploaded={(url) => setSettings({ ...settings, seo_default_og_image: url })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Umami Website ID (optional)</Label>
            <Input
              value={settings.analytics_umami_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, analytics_umami_id: e.target.value || null })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Umami Script URL (optional)</Label>
            <Input
              value={settings.analytics_umami_url || ""}
              onChange={(e) =>
                setSettings({ ...settings, analytics_umami_url: e.target.value || null })
              }
              placeholder="https://cloud.umami.is/script.js"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
