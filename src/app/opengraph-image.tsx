import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const profile = await getPublicProfile();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #020817 0%, #0f172a 55%, #020817 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "20px",
            color: "#38bdf8",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: "#38bdf8",
            }}
          />
          Interactive 3D Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "78px", fontWeight: 800, lineHeight: 1.02 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: "34px", color: "#94a3b8", fontWeight: 500 }}>
            {profile.title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148,163,184,0.22)",
            paddingTop: "24px",
            fontSize: "22px",
            color: "#cbd5e1",
          }}
        >
          <span>{profile.email}</span>
          <span style={{ color: "#fb923c" }}>Next.js · Three.js · Supabase</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
