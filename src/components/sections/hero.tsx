"use client";

import Link from "next/link";
import React from "react";
import { FileText } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreloader } from "@/components/preloader";
import { BlurIn, BoxReveal } from "@/components/reveal-animations";
import ScrollDownIcon from "@/components/scroll-down-icon";
import SectionWrapper from "@/components/ui/section-wrapper";
import AnimatedPhoto from "@/components/AnimatedPhoto";
import type { Profile } from "@/types/database";

export default function HeroSection({ profile }: { profile: Profile }) {
  const { isLoading } = usePreloader();

  const resumeHref = profile.resume_url || "/resume";
  const resumeExternal = Boolean(profile.resume_url?.startsWith("http"));

  return (
    <SectionWrapper id="hero" className="relative w-full min-h-screen">
      <div className="grid md:grid-cols-2 max-w-7xl mx-auto">
        <div
          className={cn(
            "min-h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-start md:justify-center items-center md:items-start",
            "pt-28 px-6 sm:pb-16 md:p-16 lg:p-20"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div>
                <BlurIn delay={0.35}>
                  <p className="md:self-start mt-4 font-medium text-base sm:text-xl text-slate-600 dark:text-zinc-400 cursor-default">
                    {profile.greeting}
                  </p>
                </BlurIn>

                <BlurIn delay={0.55}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <h1 className="leading-[0.95] text-foreground font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl cursor-default font-display tracking-tight mt-2">
                        {profile.first_name}
                        <br />
                        {profile.last_name}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="dark:bg-white dark:text-black">
                      Psst... open DevTools console for a secret ✨
                    </TooltipContent>
                  </Tooltip>
                </BlurIn>

                <BlurIn delay={0.75}>
                  <p className="md:self-start mt-4 font-medium text-base sm:text-xl text-slate-600 dark:text-zinc-400 cursor-default">
                    {profile.title}
                  </p>
                </BlurIn>
              </div>

              <div className="mt-8 flex flex-col gap-3 w-fit">
                <Link
                  href={resumeHref}
                  target={resumeExternal ? "_blank" : undefined}
                  rel={resumeExternal ? "noopener noreferrer" : undefined}
                  className="flex-1 cursor-can-hover rounded-md"
                >
                  <BoxReveal delay={1.0} width="100%">
                    <Button className="flex items-center gap-2 w-full h-11 px-6">
                      <FileText className="size-4" />
                      <span>Resume</span>
                    </Button>
                  </BoxReveal>
                </Link>

                <div className="md:self-start flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href="#contact" className="cursor-can-hover rounded-md">
                        <Button variant="outline" className="h-10 px-5">
                          Hire Me
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Let&apos;s build something great together</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex items-center gap-2">
                    {profile.socials.twitter && (
                      <Link
                        href={profile.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X / Twitter"
                        className="cursor-can-hover rounded-md"
                      >
                        <Button variant="outline" size="icon">
                          <SiX size={18} />
                        </Button>
                      </Link>
                    )}
                    {profile.socials.github && (
                      <Link
                        href={profile.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="cursor-can-hover rounded-md"
                      >
                        <Button variant="outline" size="icon">
                          <SiGithub size={19} />
                        </Button>
                      </Link>
                    )}
                    {profile.socials.linkedin && (
                      <Link
                        href={profile.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="cursor-can-hover rounded-md"
                      >
                        <Button variant="outline" size="icon">
                          <FaLinkedin size={19} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column reserved for the floating 3D mechanical keyboard + optional animated portrait */}
        {profile.show_animated_photo && profile.avatar_url ? (
          <div className="col-span-1 pointer-events-none flex items-center justify-center pt-10 pb-16 md:h-[calc(100dvh-4rem)] md:items-end md:justify-end md:pt-0 md:pb-24 lg:pb-12 md:pr-6 lg:pr-12 z-[2]">
            <AnimatedPhoto
              src={profile.avatar_url}
              alt={profile.photo_alt || `Portrait of ${profile.name}`}
              show={profile.show_animated_photo}
              animationStyle={profile.photo_animation_style}
              priority
            />
          </div>
        ) : (
          <div className="hidden md:block col-span-1" />
        )}
      </div>

      <div className="absolute top-[calc(100dvh-5.5rem)] md:top-auto md:bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
}
