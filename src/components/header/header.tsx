"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { opacity, background } from "./anim";
import NavDrawer from "./nav";
import { cn } from "@/lib/utils";
import FunnyThemeToggle from "@/components/theme/funny-theme-toggle";
import { Button } from "@/components/ui/button";
import type { Profile, SiteSettings } from "@/types/database";

interface HeaderProps {
  profile: Profile;
  settings: SiteSettings;
}

export default function Header({ profile, settings }: HeaderProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 w-full z-[1000] box-border px-4 sm:px-6 py-3.5 backdrop-blur-md transition-colors duration-300 ease-in pointer-events-auto",
        isActive ? "bg-background/95 border-b border-border/60" : "bg-background/40"
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
        <Link href="/" className="flex items-center cursor-can-hover rounded-md shrink-0">
          <Button variant="link" className="px-0 h-8 text-sm sm:text-base font-medium tracking-tight">
            {profile.name}
          </Button>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <FunnyThemeToggle className="w-8 h-8 flex" />

          <Button
            variant="ghost"
            onClick={() => setIsActive((prev) => !prev)}
            aria-label={isActive ? "Close menu" : "Open menu"}
            aria-expanded={isActive}
            className="m-0 px-2 h-8 bg-transparent hover:bg-transparent flex items-center justify-center gap-3 cursor-pointer"
          >
            <div className="relative hidden md:flex items-center w-12 justify-end">
              <motion.p
                variants={opacity}
                animate={!isActive ? "open" : "closed"}
                className="text-sm lowercase m-0"
              >
                menu
              </motion.p>
              <motion.p
                variants={opacity}
                animate={isActive ? "open" : "closed"}
                className="text-sm lowercase absolute right-0 m-0"
              >
                close
              </motion.p>
            </div>
            <div className="relative w-6 h-4 flex flex-col justify-center items-center pointer-events-none">
              <span
                className={cn(
                  "block h-[1.5px] w-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                  isActive ? "translate-y-[1px] rotate-45" : "-translate-y-1"
                )}
              />
              <span
                className={cn(
                  "block h-[1.5px] w-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                  isActive ? "-translate-y-[0.5px] -rotate-45" : "translate-y-1"
                )}
              />
            </div>
          </Button>
        </div>
      </div>

      {/* Backdrop scrim below drawer */}
      <motion.div
        variants={background}
        initial="initial"
        animate={isActive ? "open" : "closed"}
        onClick={() => setIsActive(false)}
        className={cn(
          "bg-black/60 backdrop-blur-xs w-full absolute left-0 top-full",
          isActive ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      <AnimatePresence mode="wait">
        {isActive && <NavDrawer links={settings.nav_links} setIsActive={setIsActive} />}
      </AnimatePresence>
    </motion.header>
  );
}
