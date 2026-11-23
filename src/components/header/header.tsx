"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import styles from "./style.module.scss";
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

  return (
    <motion.header
      className={cn(styles.header, "transition-colors duration-300 ease-in")}
      style={{
        background: isActive ? "hsl(var(--background) / 0.92)" : "hsl(var(--background) / 0.35)",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className={cn(styles.bar, "max-w-7xl mx-auto")}>
        <Link href="/" className="flex items-center cursor-can-hover rounded-md">
          <Button variant="link" className="px-0 text-sm sm:text-base font-medium tracking-tight">
            {profile.name}
          </Button>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <FunnyThemeToggle className="w-8 h-8 hidden md:flex" />

          <Button
            variant="ghost"
            onClick={() => setIsActive((prev) => !prev)}
            aria-label={isActive ? "Close menu" : "Open menu"}
            aria-expanded={isActive}
            className={cn(
              styles.el,
              "m-0 px-2 h-8 bg-transparent hover:bg-transparent flex items-center justify-center"
            )}
          >
            <div className="relative hidden md:flex items-center w-12 justify-end">
              <motion.p
                variants={opacity}
                animate={!isActive ? "open" : "closed"}
                className="text-sm lowercase"
              >
                menu
              </motion.p>
              <motion.p
                variants={opacity}
                animate={isActive ? "open" : "closed"}
                className="text-sm lowercase absolute right-0"
              >
                close
              </motion.p>
            </div>
            <div className={cn(styles.burger, isActive && styles.burgerActive)} />
          </Button>
        </div>
      </div>

      <motion.div
        variants={background}
        initial="initial"
        animate={isActive ? "open" : "closed"}
        onClick={() => setIsActive(false)}
        className={cn(styles.background, !isActive && "pointer-events-none")}
      />

      <AnimatePresence mode="wait">
        {isActive && <NavDrawer links={settings.nav_links} setIsActive={setIsActive} />}
      </AnimatePresence>
    </motion.header>
  );
}
