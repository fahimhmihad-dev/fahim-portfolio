"use client";

import React, { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function MediaUploader({
  folder = "uploads",
  accept = "image/*,application/pdf",
  label = "Upload file",
  onUploaded,
}: {
  folder?: string;
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json()) as { data?: { url: string }; error?: string };
      if (!res.ok || !json.data?.url) {
        throw new Error(json.error || "Upload failed");
      }

      onUploaded(json.data.url);
      toast.success("Uploaded to Supabase Storage");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="gap-1.5 shrink-0"
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Uploading..." : label}
      </Button>
    </>
  );
}
