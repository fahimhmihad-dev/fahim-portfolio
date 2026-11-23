"use client";

import { Zap, ZapOff } from "lucide-react";
import { setMotionPreference, usePerfProfile } from "@/hooks/use-perf-profile";
import { Button } from "@/components/ui/button";

export default function MotionToggle() {
  const { ready, reducedMotion } = usePerfProfile();
  const motionOn = ready ? !reducedMotion : true;
  const Icon = motionOn ? Zap : ZapOff;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setMotionPreference(reducedMotion ? "on" : "off")}
      aria-pressed={reducedMotion}
      aria-label={motionOn ? "Reduce motion and disable 3D" : "Enable motion and 3D"}
      className="bg-transparent gap-2 border-border/70 text-xs text-muted-foreground hover:text-foreground"
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{motionOn ? "Reduce motion" : "Enable motion"}</span>
    </Button>
  );
}
