"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { usePreloader } from "@/components/preloader";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { PhotoAnimationStyle } from "@/types/database";

const PORTRAIT_BLUR_DATA_URL =
  "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAABQAgCdASoQABAAA4BaJbACdIExGZzpWMtyxAAA/vWVi+OM5M9IMiDhPcBt0ISiQidE3Tc6DlZCKGCOOYrG50qIUf32OfzYLDAmEoszlUcoOf/XPHtdapzSEsAJhoUaAAA=";

const MAX_TILT_DEG = 8;

export interface AnimatedPhotoProps {
  src?: string | null;
  alt?: string;
  show?: boolean;
  animationStyle?: PhotoAnimationStyle;
  priority?: boolean;
  className?: string;
}

export default function AnimatedPhoto({
  src,
  alt = "Portrait of Fahim H. Mihad",
  show = true,
  animationStyle = "tilt",
  priority = false,
  className,
}: AnimatedPhotoProps) {
  const { isLoading } = usePreloader();
  const { reducedMotion } = usePerfProfile();
  const containerRef = useRef<HTMLElement>(null);
  const canHoverPointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [isHovering, setIsHovering] = useState(false);

  // Scroll parallax (GPU transform only)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  // Desktop 3D cursor tilt + sheen position (transform & opacity only)
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);

  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 22, mass: 0.6 });

  const highlightGlow = useMotionTemplate`radial-gradient(220px circle at ${pointerX}% ${pointerY}%, var(--brand), transparent 70%)`;

  const enableFloat = !reducedMotion && (animationStyle === "float" || animationStyle === "tilt");
  const enableTilt = !reducedMotion && animationStyle === "tilt" && canHoverPointer;
  const enableParallax = !reducedMotion && animationStyle !== "minimal";

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1

    rawRotateY.set((nx - 0.5) * 2 * MAX_TILT_DEG);
    rawRotateX.set((0.5 - ny) * 2 * MAX_TILT_DEG);
    pointerX.set(nx * 100);
    pointerY.set(ny * 100);
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    pointerX.set(50);
    pointerY.set(50);
  };

  if (!show || !src) return null;

  const isLocalPortrait = src.startsWith("/me/");

  return (
    <figure
      ref={containerRef}
      className={cn("pointer-events-auto relative m-0 select-none", className)}
      style={{ perspective: enableTilt ? 900 : undefined }}
    >
      {/* Scroll parallax layer */}
      <motion.div style={{ y: enableParallax ? parallaxY : 0 }}>
        {/* Entrance synced with preloader completion */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
          animate={
            isLoading
              ? reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{
            duration: reducedMotion ? 0.3 : 0.85,
            delay: isLoading ? 0 : reducedMotion ? 0 : 0.95,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Idle slow vertical floating loop (6-8s) */}
          <motion.div
            animate={enableFloat ? { y: [0, -7, 0] } : { y: 0 }}
            transition={
              enableFloat
                ? {
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0 }
            }
          >
            {/* Interactive 3D tilt frame */}
            <motion.div
              onPointerMove={handlePointerMove}
              onPointerEnter={() => enableTilt && setIsHovering(true)}
              onPointerLeave={handlePointerLeave}
              style={{
                rotateX: enableTilt ? rotateX : 0,
                rotateY: enableTilt ? rotateY : 0,
                transformStyle: enableTilt ? "preserve-3d" : undefined,
              }}
              className="group relative w-[116px] h-[116px] sm:w-[140px] sm:h-[140px] md:w-[168px] md:h-[168px] lg:w-[204px] lg:h-[204px] will-change-transform"
            >
              {/* Subtle theme-aware ambient glow behind frame */}
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -inset-2 rounded-[30px] blur-2xl transition-opacity duration-500",
                  "bg-gradient-to-tr from-foreground/15 via-border/40 to-primary/20",
                  "dark:from-foreground/15 dark:via-primary/15 dark:to-foreground/10",
                  isHovering ? "opacity-85" : "opacity-45"
                )}
              />

              {/* Outer theme-aware gradient ring */}
              <div
                className={cn(
                  "relative h-full w-full rounded-[26px] p-[1.5px] transition-shadow duration-500",
                  "bg-gradient-to-br from-foreground/25 via-border to-foreground/10",
                  "shadow-[0_18px_45px_-16px_hsl(var(--foreground)/0.22)]",
                  "dark:shadow-[0_24px_55px_-16px_rgba(0,0,0,0.85)]"
                )}
              >
                {/* Inner masked portrait container */}
                <div className="relative h-full w-full overflow-hidden rounded-[24.5px] bg-card">
                  <Image
                    src={src}
                    alt={alt || "Portrait of Fahim H. Mihad"}
                    width={512}
                    height={512}
                    priority={priority}
                    sizes="(max-width: 640px) 116px, (max-width: 768px) 140px, (max-width: 1024px) 168px, 204px"
                    placeholder={isLocalPortrait ? "blur" : "empty"}
                    blurDataURL={isLocalPortrait ? PORTRAIT_BLUR_DATA_URL : undefined}
                    className={cn(
                      "h-full w-full object-cover object-top transition-transform duration-500 ease-out",
                      enableTilt && "group-hover:scale-[1.04]"
                    )}
                  />

                  {/* Subtle bottom vignette blending frame naturally into card edge */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent dark:from-background/50"
                  />

                  {/* Cursor-following sheen glow (desktop tilt only) */}
                  {enableTilt && (
                    <motion.div
                      aria-hidden="true"
                      style={{ background: highlightGlow }}
                      animate={{ opacity: isHovering ? 0.16 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="pointer-events-none absolute inset-0 mix-blend-overlay"
                    />
                  )}

                  {/* Crisp inner glass rim */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[24.5px] ring-1 ring-inset ring-foreground/10"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </figure>
  );
}
