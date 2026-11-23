"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Particles from "@/components/particles";
import ElasticCursor from "@/components/ui/elastic-cursor";
import EasterEggs from "@/components/easter-eggs";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import type { Profile, SiteSettings } from "@/types/database";
import { Wrench } from "lucide-react";

export default function SiteFrame({
  children,
  profile,
  settings,
}: {
  children: React.ReactNode;
  profile: Profile;
  settings: SiteSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const { particleCount, maxDpr, disableDecorative } = usePerfProfile();

  if (isAdmin) {
    return <>{children}</>;
  }

  if (settings.maintenance_mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-foreground">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
            <Wrench className="size-6 text-foreground" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground leading-relaxed">{settings.maintenance_message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header profile={profile} settings={settings} />
      {children}
      <Footer profile={profile} settings={settings} />
      {settings.enable_particles && particleCount > 0 && (
        <Particles
          className="fixed inset-0 -z-10"
          quantity={particleCount}
          maxDpr={maxDpr}
        />
      )}
      {!disableDecorative && <EasterEggs ownerName={profile.name} />}
      {settings.enable_elastic_cursor && !disableDecorative && <ElasticCursor />}
    </>
  );
}
