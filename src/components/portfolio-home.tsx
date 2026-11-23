"use client";

import React from "react";
import SmoothScroll from "@/components/smooth-scroll";
import AnimatedBackground from "@/components/animated-background";
import HeroSection from "@/components/sections/hero";
import SkillsSection from "@/components/sections/skills";
import ExperienceSection from "@/components/sections/experience";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";
import type { PortfolioPayload } from "@/types/database";

export default function PortfolioHome({ data }: { data: PortfolioPayload }) {
  const { profile, settings, skills, experiences, projects } = data;
  const sections = settings.sections;

  return (
    <SmoothScroll>
      <AnimatedBackground
        skills={skills}
        enabled={settings.enable_3d_keyboard && sections.skills}
      />
      <main className="bg-slate-100/80 dark:bg-transparent canvas-overlay-mode relative z-10">
        {sections.hero && <HeroSection profile={profile} />}
        {sections.skills && (
          <SkillsSection skills={skills} enable3D={settings.enable_3d_keyboard} />
        )}
        {sections.experience && (
          <ExperienceSection experiences={experiences} skills={skills} />
        )}
        {sections.projects && <ProjectsSection projects={projects} skills={skills} />}
        {sections.contact && <ContactSection profile={profile} />}
      </main>
    </SmoothScroll>
  );
}
