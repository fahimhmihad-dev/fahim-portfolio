"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { blur, translate } from "../anim";
import type { NavLinkItem } from "@/types/database";
import { cn } from "@/lib/utils";

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
        className="pointer-events-none inline-block"
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
    <nav
      aria-label="Primary navigation"
      className="flex flex-col items-start md:flex-row md:flex-wrap gap-x-8 gap-y-3 mt-4 lg:mt-8 max-w-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      {links.map((link, index) => {
        const isCurrent = pathname === link.href;
        return (
          <Link
            key={`${link.href}-${index}`}
            href={link.href}
            className="cursor-can-hover rounded-lg uppercase no-underline"
            onClick={() => setIsActive(false)}
          >
            <motion.p
              className={cn(
                "font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight flex overflow-hidden m-0 py-1 transition-colors",
                isCurrent
                  ? "text-foreground underline underline-offset-8 decoration-2"
                  : "text-muted-foreground hover:text-foreground"
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
    </nav>
  );
}
