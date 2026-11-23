"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionHeader } from "./section-header";
import SectionWrapper from "@/components/ui/section-wrapper";
import ScrollingPreview from "@/components/scrolling-preview";
import SlideShow from "@/components/slide-show";
import type { Project, Skill } from "@/types/database";

export default function ProjectsSection({
  projects,
  skills,
}: {
  projects: Project[];
  skills: Skill[];
}) {
  const skillMap = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const s of skills) {
      map.set(s.name.toLowerCase(), s);
      map.set(s.slug.toLowerCase(), s);
    }
    return map;
  }, [skills]);

  if (projects.length === 0) return null;

  return (
    <SectionWrapper id="projects" className="max-w-7xl mx-auto min-h-screen px-4 py-24">
      <SectionHeader id="projects" title="Projects" className="static mb-14 md:mb-20" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} skillMap={skillMap} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function buildDockItems(tags: string[], skillMap: Map<string, Skill>) {
  return tags.map((tag) => {
    const matched = skillMap.get(tag.toLowerCase());
    return {
      title: matched?.name || tag,
      icon: matched?.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={matched.icon}
          alt={matched.name}
          className={
            ["nextjs", "threejs", "vercel"].includes(matched.slug.toLowerCase())
              ? "w-full h-full object-contain dark:invert"
              : "w-full h-full object-contain"
          }
        />
      ) : (
        <Code2 className="w-4 h-4 text-foreground" />
      ),
    };
  });
}

function ProjectCard({
  project,
  skillMap,
}: {
  project: Project;
  skillMap: Map<string, Skill>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const frontendItems = useMemo(
    () => buildDockItems(project.tech_frontend, skillMap),
    [project.tech_frontend, skillMap]
  );
  const backendItems = useMemo(
    () => buildDockItems(project.tech_backend, skillMap),
    [project.tech_backend, skillMap]
  );
  const fallbackTechItems = useMemo(
    () =>
      frontendItems.length === 0 && backendItems.length === 0
        ? buildDockItems(project.tech_tags, skillMap)
        : [],
    [frontendItems.length, backendItems.length, project.tech_tags, skillMap]
  );

  const images = project.gallery.length > 0 ? project.gallery : project.cover_url ? [project.cover_url] : [];

  return (
    <div className="flex items-center justify-center pointer-events-auto">
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <button
            type="button"
            className="group relative w-full max-w-[420px] rounded-xl overflow-hidden ring-1 ring-border/70 hover:ring-primary/40 transition text-left cursor-pointer"
            style={{ aspectRatio: "3 / 2" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
          >
            <ScrollingPreview
              src={project.cover_url || "/placeholders/project-1.svg"}
              alt={project.title}
              bg={project.backdrop_url}
              isHovered={isHovered}
            />
            <div className="absolute w-full h-28 bottom-0 left-0 bg-gradient-to-t from-background via-background/85 to-transparent pointer-events-none z-10">
              <div className="flex flex-col h-full items-start justify-end p-4 gap-1.5">
                <div className="text-base md:text-lg font-display font-bold text-foreground">
                  {project.title}
                </div>
                <div className="text-[11px] font-medium bg-primary text-primary-foreground rounded-full w-fit px-2.5 py-0.5">
                  {project.category}
                </div>
              </div>
            </div>
          </button>
        </ResponsiveDialogTrigger>

        <ResponsiveDialogContent className="md:max-w-4xl md:h-[85vh] md:!flex md:flex-col md:overflow-hidden md:p-0 md:gap-0">
          {/* Sticky modal header */}
          <div className="shrink-0 border-b border-border bg-background/90 backdrop-blur-sm px-6 md:px-8 py-5 pr-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <ResponsiveDialogTitle className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                  {project.title}
                </ResponsiveDialogTitle>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-0.5">
                  {project.category}
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-4">
                {project.repo_url && project.repo_url !== "#" && (
                  <Link
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Source
                  </Link>
                )}
                {project.live_url && project.live_url !== "#" && (
                  <Link
                    href={project.live_url}
                    target={project.live_url.startsWith("http") ? "_blank" : undefined}
                    rel={project.live_url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group/visit inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs md:text-sm font-medium px-4 py-1.5 rounded-full hover:bg-primary/85 transition-colors"
                  >
                    Visit
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
            {project.tagline && (
              <ResponsiveDialogDescription className="mt-2 text-sm text-muted-foreground">
                {project.tagline}
              </ResponsiveDialogDescription>
            )}
          </div>

          {/* Scrollable project details */}
          <ScrollArea className="flex-1" data-lenis-prevent>
            <div className="px-6 md:px-8 py-7 space-y-8">
              {(frontendItems.length > 0 || backendItems.length > 0 || fallbackTechItems.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-10"
                >
                  {frontendItems.length > 0 && (
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        Frontend
                      </span>
                      <FloatingDock items={frontendItems} />
                    </div>
                  )}
                  {backendItems.length > 0 && (
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        Backend
                      </span>
                      <FloatingDock items={backendItems} />
                    </div>
                  )}
                  {fallbackTechItems.length > 0 && (
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        Tech Stack
                      </span>
                      <FloatingDock items={fallbackTechItems} />
                    </div>
                  )}
                </motion.div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {images.length > 0 && <SlideShow images={images} />}

              {project.description && (
                <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
