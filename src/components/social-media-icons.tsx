"use client";

import React from "react";
import Link from "next/link";
import { SiGithub, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialLinks } from "@/types/database";

interface SocialItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function SocialMediaButtons({ socials }: { socials: SocialLinks }) {
  const raw: Array<{ name: string; href?: string; icon: React.ReactNode }> = [
    { name: "GitHub", href: socials.github, icon: <SiGithub size={18} /> },
    { name: "LinkedIn", href: socials.linkedin, icon: <FaLinkedin size={18} /> },
    { name: "X / Twitter", href: socials.twitter, icon: <SiX size={16} /> },
    { name: "Instagram", href: socials.instagram, icon: <SiInstagram size={18} /> },
    { name: "YouTube", href: socials.youtube, icon: <SiYoutube size={18} /> },
    { name: "Website", href: socials.website, icon: <Globe size={18} /> },
  ];

  const items: SocialItem[] = raw.filter((item): item is SocialItem =>
    Boolean(item.href && item.href.trim().length > 0)
  );

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 z-10">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
          className="cursor-can-hover rounded-md"
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/80 hover:text-foreground"
          >
            {item.icon}
          </Button>
        </Link>
      ))}
    </div>
  );
}
