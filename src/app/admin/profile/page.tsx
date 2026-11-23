"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MediaUploader from "@/components/admin/media-uploader";
import type { PhotoAnimationStyle, Profile } from "@/types/database";

const schema = z.object({
  name: z.string().min(1, "Required"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  greeting: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  bio: z.string(),
  location: z.string(),
  email: z.string().email("Invalid email"),
  avatar_url: z.string(),
  show_animated_photo: z.boolean(),
  photo_animation_style: z.enum(["float", "tilt", "minimal"]),
  photo_alt: z.string(),
  resume_url: z.string(),
  github: z.string(),
  linkedin: z.string(),
  twitter: z.string(),
  instagram: z.string(),
  youtube: z.string(),
  website: z.string(),
  whatsapp: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  seo_keywords: z.string(),
  og_image_url: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      first_name: "",
      last_name: "",
      greeting: "Hi, I am",
      title: "",
      bio: "",
      location: "",
      email: "",
      avatar_url: "/me/portrait-2x.webp",
      show_animated_photo: true,
      photo_animation_style: "tilt",
      photo_alt: "Portrait of Fahim H. Mihad",
      resume_url: "",
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: "",
      website: "",
      whatsapp: "http://wa.me/+8801522125856",
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image_url: "",
    },
  });

  const watchedAvatar = useWatch({ control: form.control, name: "avatar_url" });
  const watchedShowPhoto = useWatch({ control: form.control, name: "show_animated_photo" });
  const watchedPhotoStyle = useWatch({ control: form.control, name: "photo_animation_style" });
  const watchedPhotoAlt = useWatch({ control: form.control, name: "photo_alt" });

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then(({ data }: { data: Profile | null }) => {
        if (!data) return;
        form.reset({
          name: data.name || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          greeting: data.greeting || "Hi, I am",
          title: data.title || "",
          bio: data.bio || "",
          location: data.location || "",
          email: data.email || "",
          avatar_url: data.avatar_url || "",
          show_animated_photo: data.show_animated_photo ?? true,
          photo_animation_style: (data.photo_animation_style as PhotoAnimationStyle) || "tilt",
          photo_alt: data.photo_alt || "Portrait of Fahim H. Mihad",
          resume_url: data.resume_url || "",
          github: data.socials?.github || "",
          linkedin: data.socials?.linkedin || "",
          twitter: data.socials?.twitter || "",
          instagram: data.socials?.instagram || "",
          youtube: data.socials?.youtube || "",
          website: data.socials?.website || "",
          whatsapp: data.socials?.whatsapp || "http://wa.me/+8801522125856",
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          seo_keywords: (data.seo_keywords || []).join(", "),
          og_image_url: data.og_image_url || "",
        });
      })
      .finally(() => setLoading(false));
  }, [form]);

  const onSubmit = async (v: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        name: v.name,
        first_name: v.first_name,
        last_name: v.last_name,
        greeting: v.greeting,
        title: v.title,
        bio: v.bio,
        location: v.location,
        email: v.email,
        avatar_url: v.avatar_url || null,
        show_animated_photo: v.show_animated_photo,
        photo_animation_style: v.photo_animation_style,
        photo_alt: v.photo_alt || `Portrait of ${v.name}`,
        resume_url: v.resume_url || null,
        socials: {
          github: v.github,
          linkedin: v.linkedin,
          twitter: v.twitter,
          instagram: v.instagram,
          youtube: v.youtube,
          website: v.website,
          whatsapp: v.whatsapp,
        },
        seo_title: v.seo_title,
        seo_description: v.seo_description,
        seo_keywords: v.seo_keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        og_image_url: v.og_image_url || null,
      };

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast.success("Profile updated & published to live site!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Profile &amp; Hero</h1>
          <p className="text-sm text-muted-foreground">
            Controls your Hero identity, animated portrait, résumé download, social links, and SEO
            metadata.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Changes
        </Button>
      </div>

      {/* Animated Personal Photo Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Animated Photo
              </CardTitle>
              <CardDescription>
                Upload or replace your portrait, toggle visibility, and choose the hero animation
                style. Turning this off restores the original hero layout exactly.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2.5">
              <Label htmlFor="show-animated-photo" className="text-xs text-muted-foreground">
                {watchedShowPhoto ? "Visible" : "Hidden"}
              </Label>
              <Switch
                id="show-animated-photo"
                checked={Boolean(watchedShowPhoto)}
                onCheckedChange={(checked) =>
                  form.setValue("show_animated_photo", checked, { shouldDirty: true })
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
            {/* Live Preview */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="relative w-44 h-44 rounded-3xl p-[1.5px] bg-gradient-to-br from-foreground/25 via-border to-foreground/10 shadow-md">
                <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-muted flex items-center justify-center">
                  {watchedAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={watchedAvatar}
                      alt={watchedPhotoAlt || "Portrait preview"}
                      className={`h-full w-full object-cover object-top transition-opacity ${
                        watchedShowPhoto ? "opacity-100" : "opacity-35 grayscale"
                      }`}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground px-4 text-center">
                      No image selected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={watchedShowPhoto && watchedAvatar ? "default" : "secondary"}>
                  {watchedShowPhoto && watchedAvatar ? "Active" : "Off"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {watchedPhotoStyle}
                </Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-avatar-url">Portrait Image URL</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="profile-avatar-url"
                    className="flex-1 min-w-[200px]"
                    {...form.register("avatar_url")}
                    placeholder="/me/portrait-2x.webp or upload via Storage"
                  />
                  <MediaUploader
                    folder="avatars"
                    accept="image/*"
                    label="Upload Photo"
                    onUploaded={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Reset to built-in optimized portrait"
                    onClick={() =>
                      form.setValue("avatar_url", "/me/portrait-2x.webp", { shouldDirty: true })
                    }
                    className="gap-1 text-xs"
                  >
                    <RotateCcw className="size-3.5" /> Default
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="photo-animation-style">Animation Style</Label>
                  <select
                    id="photo-animation-style"
                    value={watchedPhotoStyle}
                    onChange={(e) =>
                      form.setValue(
                        "photo_animation_style",
                        e.target.value as PhotoAnimationStyle,
                        { shouldDirty: true }
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="tilt">3D Tilt + Float + Glow (Default)</option>
                    <option value="float">Gentle Float + Parallax</option>
                    <option value="minimal">Minimal (Fade Only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="photo-alt-text">Accessible Alt Text</Label>
                  <Input
                    id="photo-alt-text"
                    {...form.register("photo_alt")}
                    placeholder="Portrait of Fahim H. Mihad"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identity &amp; Hero Copy</CardTitle>
          <CardDescription>Displayed in the navbar, hero section, resume, and footer.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input id="profile-name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-greeting">Greeting Eyebrow</Label>
            <Input id="profile-greeting" {...form.register("greeting")} placeholder="Hi, I am" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-first-name">Hero Heading Line 1</Label>
            <Input id="profile-first-name" {...form.register("first_name")} placeholder="Fahim H." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-last-name">Hero Heading Line 2</Label>
            <Input id="profile-last-name" {...form.register("last_name")} placeholder="Mihad" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-title">Role / Headline</Label>
            <Input
              id="profile-title"
              {...form.register("title")}
              placeholder="A Full Stack Web Developer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Contact Email</Label>
            <Input id="profile-email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-location">Location</Label>
            <Input
              id="profile-location"
              {...form.register("location")}
              placeholder="Dhaka, Bangladesh"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="profile-bio">Bio / Summary</Label>
            <Textarea id="profile-bio" rows={4} {...form.register("bio")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé PDF</CardTitle>
          <CardDescription>Upload directly to Supabase Storage or paste a PDF URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-resume-url">Résumé PDF URL</Label>
            <div className="flex gap-2">
              <Input
                id="profile-resume-url"
                {...form.register("resume_url")}
                placeholder="Upload PDF or paste URL"
              />
              <MediaUploader
                folder="resumes"
                accept="application/pdf"
                label="Upload PDF"
                onUploaded={(url) => form.setValue("resume_url", url, { shouldDirty: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Social Profiles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="social-github">GitHub URL</Label>
            <Input id="social-github" {...form.register("github")} placeholder="https://github.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-linkedin">LinkedIn URL</Label>
            <Input
              id="social-linkedin"
              {...form.register("linkedin")}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-twitter">X / Twitter URL</Label>
            <Input id="social-twitter" {...form.register("twitter")} placeholder="https://x.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-instagram">Instagram URL</Label>
            <Input
              id="social-instagram"
              {...form.register("instagram")}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-youtube">YouTube URL</Label>
            <Input
              id="social-youtube"
              {...form.register("youtube")}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-website">Website URL</Label>
            <Input id="social-website" {...form.register("website")} placeholder="https://..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="social-whatsapp">WhatsApp URL</Label>
            <Input
              id="social-whatsapp"
              {...form.register("whatsapp")}
              placeholder="http://wa.me/+8801522125856"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO &amp; Open Graph</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Page Title</Label>
            <Input id="seo-title" {...form.register("seo_title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-desc">SEO Meta Description</Label>
            <Textarea id="seo-desc" rows={3} {...form.register("seo_description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
            <Input id="seo-keywords" {...form.register("seo_keywords")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-og">Custom OG Image URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="seo-og"
                {...form.register("og_image_url")}
                placeholder="Leave blank for dynamic OG"
              />
              <MediaUploader
                folder="seo"
                accept="image/*"
                label="Upload OG"
                onUploaded={(url) => form.setValue("og_image_url", url, { shouldDirty: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
