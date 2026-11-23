"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SocialMediaButtons from "@/components/social-media-icons";
import type { Profile, SiteSettings } from "@/types/database";

export default function Footer({
  profile,
  settings,
}: {
  profile: Profile;
  settings: SiteSettings;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 flex w-full shrink-0 flex-col items-center gap-3 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-6 sm:flex-row md:px-8 sm:justify-between">
      <p className="text-xs text-muted-foreground text-center sm:text-left">
        © {year} {profile.name}. {settings.footer_text}
      </p>

      <SocialMediaButtons socials={profile.socials} />

      <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 z-10">
        {settings.footer_links.map((link, index) => (
          <Link key={`${link.href}-${index}`} href={link.href}>
            <Button variant="link" size="sm" className="text-xs px-2">
              {link.title}
            </Button>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
