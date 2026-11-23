"use client";

import { useEffect, type CSSProperties } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "@/components/ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { cn } from "@/lib/utils";
import { useSceneStatus } from "@/lib/scene-health";
import type { Skill } from "@/types/database";

export default function SkillsSection({
  skills,
  enable3D = true,
}: {
  skills: Skill[];
  enable3D?: boolean;
}) {
  const { disable3D, ready } = usePerfProfile();
  const sceneStatus = useSceneStatus();
  const showGrid = !enable3D || !ready || disable3D || sceneStatus !== "ready";

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [showGrid]);

  if (skills.length === 0) return null;

  return (
    <SectionWrapper
      id="skills"
      className={
        showGrid
          ? "flex w-full min-h-screen flex-col justify-center py-24"
          : "w-full h-screen md:h-[140dvh] pointer-events-none"
      }
    >
      <SectionHeader
        id="skills"
        title="Tech Stack"
        desc={showGrid ? "Tools & technologies I build with" : "(hint: hover, tap, or press a key)"}
        className={showGrid ? "static mb-14" : "mb-40"}
      />

      <ul
        className={
          showGrid
            ? "mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
            : "sr-only"
        }
      >
        {skills.map((skill) => (
          <li
            key={skill.id}
            style={{ "--skill": skill.color } as CSSProperties}
            className={cn(
              "pointer-events-auto group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-5",
              "border border-border/60 bg-card/60 dark:bg-secondary/20 backdrop-blur-sm",
              "transition-[transform,border-color,background-color,box-shadow] duration-300",
              "hover:-translate-y-1 hover:border-[var(--skill)] hover:bg-secondary/40",
              "hover:shadow-[0_10px_40px_-12px_var(--skill)]"
            )}
          >
            <span
              aria-hidden
              style={{ background: "var(--skill)" }}
              className="pointer-events-none absolute -top-6 h-16 w-16 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
            />
            {skill.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={skill.icon}
                alt={skill.name}
                width={44}
                height={44}
                loading="lazy"
                className={cn(
                  "relative size-9 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 md:size-11",
                  ["nextjs", "threejs", "vercel"].includes(skill.slug.toLowerCase()) && "dark:invert"
                )}
              />
            ) : (
              <div
                className="relative flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: skill.color }}
              >
                {skill.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="relative text-center text-xs font-medium text-foreground/85 transition-colors group-hover:text-foreground md:text-sm">
              {skill.name}
            </span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
