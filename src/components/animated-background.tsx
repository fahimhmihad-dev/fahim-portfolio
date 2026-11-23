"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import type { Skill } from "@/types/database";
import { usePreloader } from "@/components/preloader";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { setSceneStatus, useSceneStatus } from "@/lib/scene-health";

const KeyboardScene = dynamic(() => import("./keyboard/keyboard-scene"), { ssr: false });

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    setSceneStatus("failed");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function SceneSession({ skills, maxDpr }: { skills: Skill[]; maxDpr: number }) {
  const status = useSceneStatus();
  const { bypassLoading } = usePreloader();

  useEffect(() => {
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      const canvas = document.createElement("canvas");
      context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    } catch {
      // Driver or policy blocked WebGL
    }
    if (!context) {
      setSceneStatus("failed");
      return () => setSceneStatus("idle");
    }
    context.getExtension("WEBGL_lose_context")?.loseContext();
    setSceneStatus("loading");
    return () => setSceneStatus("idle");
  }, []);

  useEffect(() => {
    if (status === "failed") bypassLoading();
  }, [status, bypassLoading]);

  useEffect(() => {
    if (status !== "loading") return;
    const timeout = window.setTimeout(() => setSceneStatus("failed"), 15_000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  if (status === "idle" || status === "failed") return null;

  return (
    <SceneErrorBoundary>
      <KeyboardScene skills={skills} maxDpr={maxDpr} />
    </SceneErrorBoundary>
  );
}

export default function AnimatedBackground({
  skills,
  enabled = true,
}: {
  skills: Skill[];
  enabled?: boolean;
}) {
  const { disable3D, maxDpr, ready } = usePerfProfile();
  const { bypassLoading } = usePreloader();

  useEffect(() => {
    if (!enabled) {
      setSceneStatus("failed");
      bypassLoading();
    }
  }, [enabled, bypassLoading]);

  if (!enabled || !ready || disable3D || skills.length === 0) return null;
  return <SceneSession skills={skills} maxDpr={maxDpr} />;
}
