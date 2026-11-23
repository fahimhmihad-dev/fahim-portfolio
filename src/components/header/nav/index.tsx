"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { height, opacity } from "../anim";
import NavBody from "./body";
import MotionToggle from "@/components/motion-toggle";
import type { NavLinkItem } from "@/types/database";

interface NavDrawerProps {
  links: NavLinkItem[];
  setIsActive: (isActive: boolean) => void;
}

export default function NavDrawer({ links, setIsActive }: NavDrawerProps) {
  const visibleLinks = links.filter((l) => l.visible !== false);
  const [selectedLink, setSelectedLink] = useState({
    isActive: false,
    index: 0,
  });

  const activeThumb =
    visibleLinks[selectedLink.index]?.thumbnail || "/placeholders/nav-home.svg";

  return (
    <motion.div
      variants={height}
      initial="initial"
      animate="enter"
      exit="exit"
      onClick={() => setIsActive(false)}
      className="overflow-hidden relative max-w-7xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 pt-6 pb-14">
        <div className="flex flex-col justify-between flex-1 w-full">
          <NavBody
            links={visibleLinks}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
            setIsActive={setIsActive}
          />
        </div>

        <motion.div
          variants={opacity}
          initial="initial"
          animate={selectedLink.isActive ? "open" : "closed"}
          className="hidden lg:block w-[420px] h-[280px] relative shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeThumb}
            alt="Section preview"
            className="w-full h-full rounded-xl border border-border/60 object-cover shadow-2xl"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-0"
      >
        <MotionToggle />
      </motion.div>
    </motion.div>
  );
}
