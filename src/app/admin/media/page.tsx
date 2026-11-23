"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import MediaUploader from "@/components/admin/media-uploader";

interface MediaItem {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("projects");
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/media");
    const json = (await res.json()) as { data?: MediaItem[] };
    setFiles(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((json: { data?: MediaItem[] }) => {
        if (!active) return;
        setFiles(json.data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/media?path=${encodeURIComponent(deleteTarget.path)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.path !== deleteTarget.path));
      toast.success("File deleted from storage");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Upload images or PDF résumés directly to your Supabase Storage `media` bucket.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="projects">projects/</option>
            <option value="blog">blog/</option>
            <option value="avatars">avatars/</option>
            <option value="skills">skills/</option>
            <option value="resumes">resumes/</option>
            <option value="seo">seo/</option>
          </select>
          <MediaUploader
            folder={folder}
            label="Upload File"
            onUploaded={() => {
              void load();
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card className="p-14 text-center text-muted-foreground">
          Your `media` storage bucket is empty. Upload an image or PDF above to get started.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => {
            const isPdf = file.mimeType.includes("pdf") || file.name.endsWith(".pdf");
            return (
              <Card key={file.path} className="overflow-hidden flex flex-col">
                <div className="h-36 bg-muted/40 flex items-center justify-center overflow-hidden border-b border-border">
                  {isPdf ? (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <FileText className="size-8" />
                      <span className="text-xs">PDF Document</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium truncate" title={file.path}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{file.path}</p>
                  </div>
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 flex-1"
                      onClick={() => copyUrl(file.url)}
                    >
                      <Copy className="size-3" /> Copy URL
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(file)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Any pages referencing this URL will no longer be able to load the file."
        onConfirm={handleDelete}
      />
    </div>
  );
}
