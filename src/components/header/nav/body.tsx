"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.scss";
import { blur, translate } from "../anim";
import type { NavLinkItem } from "@/types/database";
import { cn } from "@/lib/utils";
import FunnyThemeToggle from "@/components/theme/funny-theme-toggle";

interface SelectedLink {
  isActive: boolean;
  index: number;
}

interface BodyProps {
  links: NavLinkItem[];
  selectedLink: SelectedLink;
  setSelectedLink: (selectedLink: SelectedLink) => void;
  setIsActive: (isActive: boolean) => void;
}

export default function NavBody({
  links,
  selectedLink,
  setSelectedLink,
  setIsActive,
}: BodyProps) {
  const pathname = usePathname();

  const getChars = (word: string) =>
    word.split("").map((char, i) => (
      <motion.span
        className="pointer-events-none"
        custom={[i * 0.02, (word.length - i) * 0.01] as [number, number]}
        variants={translate}
        initial="initial"
        animate="enter"
        exit="exit"
        key={`${char}-${i}`}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  return (
    <div
      className={cn(styles.body, "flex flex-col items-end md:flex-row")}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex md:hidden">
        <FunnyThemeToggle className="w-8 h-8" />
      </div>
      {links.map((link, index) => {
        const isCurrent = pathname === link.href;
        return (
          <Link
            key={`${link.href}-${index}`}
            href={link.href}
            className="cursor-can-hover rounded-lg"
            onClick={() => setIsActive(false)}
          >
            <motion.p
              className={cn(
                "font-display rounded-lg transition-colors",
                isCurrent ? "text-foreground underline underline-offset-8" : "text-muted-foreground hover:text-foreground"
              )}
              onMouseOver={() => setSelectedLink({ isActive: true, index })}
              onMouseLeave={() => setSelectedLink({ isActive: false, index })}
              variants={blur}
              animate={
                selectedLink.isActive && selectedLink.index !== index ? "open" : "closed"
              }
            >
              {getChars(link.title)}
            </motion.p>
          </Link>
        );
      })}
    </div>
  );
}
