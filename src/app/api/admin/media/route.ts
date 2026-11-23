import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const folders = ["", "avatars", "projects", "blog", "skills", "resumes", "seo"];
  const allFiles: Array<{
    name: string;
    path: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: string;
  }> = [];

  for (const folder of folders) {
    const { data, error } = await admin.supabase.storage
      .from("media")
      .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) continue;

    for (const item of data) {
      // Skip folder placeholders (entries without metadata/id)
      if (!item.id || item.name === ".emptyFolderPlaceholder") continue;
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      const {
        data: { publicUrl },
      } = admin.supabase.storage.from("media").getPublicUrl(fullPath);

      allFiles.push({
        name: item.name,
        path: fullPath,
        url: publicUrl,
        size: Number((item.metadata as Record<string, unknown> | null)?.size ?? 0),
        mimeType: String((item.metadata as Record<string, unknown> | null)?.mimetype ?? ""),
        createdAt: item.created_at ?? new Date().toISOString(),
      });
    }
  }

  allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ data: allFiles });
}

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const formData = await req.formData();
  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") || "uploads");
  const folder = folderRaw.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 400 });
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
  const storagePath = `${folder}/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.supabase.storage
    .from("media")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.supabase.storage.from("media").getPublicUrl(storagePath);

  return NextResponse.json(
    {
      data: {
        name: safeName,
        path: storagePath,
        url: publicUrl,
        size: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const path = new URL(req.url).searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });

  const { error } = await admin.supabase.storage.from("media").remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
