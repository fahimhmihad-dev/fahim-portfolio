"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MediaUploader from "@/components/admin/media-uploader";
import type { Profile } from "@/types/database";

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
  resume_url: z.string(),
  github: z.string(),
  linkedin: z.string(),
  twitter: z.string(),
  instagram: z.string(),
  youtube: z.string(),
  website: z.string(),
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
      avatar_url: "",
      resume_url: "",
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: "",
      website: "",
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image_url: "",
    },
  });

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
          resume_url: data.resume_url || "",
          github: data.socials?.github || "",
          linkedin: data.socials?.linkedin || "",
          twitter: data.socials?.twitter || "",
          instagram: data.socials?.instagram || "",
          youtube: data.socials?.youtube || "",
          website: data.socials?.website || "",
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
        resume_url: v.resume_url || null,
        socials: {
          github: v.github,
          linkedin: v.linkedin,
          twitter: v.twitter,
          instagram: v.instagram,
          youtube: v.youtube,
          website: v.website,
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
            Controls your Hero identity, résumé download, social links, and SEO metadata.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identity &amp; Hero Copy</CardTitle>
          <CardDescription>Displayed in the navbar, hero section, resume, and footer.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Greeting Eyebrow</Label>
            <Input {...form.register("greeting")} placeholder="Hi, I am" />
          </div>
          <div className="space-y-2">
            <Label>Hero Heading Line 1</Label>
            <Input {...form.register("first_name")} placeholder="Fahim H." />
          </div>
          <div className="space-y-2">
            <Label>Hero Heading Line 2</Label>
            <Input {...form.register("last_name")} placeholder="Mihad" />
          </div>
          <div className="space-y-2">
            <Label>Role / Headline</Label>
            <Input {...form.register("title")} placeholder="A Full Stack Web Developer" />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Location</Label>
            <Input {...form.register("location")} placeholder="Dhaka, Bangladesh" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bio / Summary</Label>
            <Textarea rows={4} {...form.register("bio")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avatar &amp; Résumé PDF</CardTitle>
          <CardDescription>Upload directly to Supabase Storage or paste a URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <div className="flex gap-2">
              <Input {...form.register("avatar_url")} placeholder="https://..." />
              <MediaUploader
                folder="avatars"
                accept="image/*"
                label="Upload Avatar"
                onUploaded={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Résumé PDF URL</Label>
            <div className="flex gap-2">
              <Input {...form.register("resume_url")} placeholder="Upload PDF or paste URL" />
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
            <Label>GitHub URL</Label>
            <Input {...form.register("github")} placeholder="https://github.com/..." />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input {...form.register("linkedin")} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <Label>X / Twitter URL</Label>
            <Input {...form.register("twitter")} placeholder="https://x.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input {...form.register("instagram")} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input {...form.register("youtube")} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input {...form.register("website")} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO &amp; Open Graph</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>SEO Page Title</Label>
            <Input {...form.register("seo_title")} />
          </div>
          <div className="space-y-2">
            <Label>SEO Meta Description</Label>
            <Textarea rows={3} {...form.register("seo_description")} />
          </div>
          <div className="space-y-2">
            <Label>Keywords (comma-separated)</Label>
            <Input {...form.register("seo_keywords")} />
          </div>
          <div className="space-y-2">
            <Label>Custom OG Image URL (optional — dynamic OG image generated automatically)</Label>
            <div className="flex gap-2">
              <Input {...form.register("og_image_url")} placeholder="Leave blank for dynamic OG" />
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
