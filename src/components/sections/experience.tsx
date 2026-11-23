"use client";

import { motion } from "motion/react";
import { SectionHeader } from "./section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SectionWrapper from "@/components/ui/section-wrapper";
import { cn } from "@/lib/utils";
import type { Experience, Skill } from "@/types/database";

export default function ExperienceSection({
  experiences,
  skills,
}: {
  experiences: Experience[];
  skills: Skill[];
}) {
  if (experiences.length === 0) return null;

  const skillLookup = new Map<string, Skill>();
  for (const s of skills) {
    skillLookup.set(s.name.toLowerCase(), s);
    skillLookup.set(s.slug.toLowerCase(), s);
  }

  return (
    <SectionWrapper
      id="experience"
      className="flex flex-col items-center justify-center min-h-[110vh] py-24"
    >
      <div className="w-full max-w-4xl px-4 md:px-8 mx-auto">
        <SectionHeader
          id="experience"
          title="Experience"
          desc="My professional journey."
          className="static mb-14 md:mb-20 mt-0"
        />

        <div className="flex flex-col gap-8 md:gap-12 relative">
          {/* Subtle vertical center connector */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-border hidden md:block -translate-x-1/2" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative pointer-events-auto"
            >
              <Card
                className={cn(
                  "group bg-card/90 dark:bg-card/85 backdrop-blur-md text-card-foreground border-border",
                  "hover:border-primary/25 transition-colors duration-300 shadow-sm hover:shadow-md"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg md:text-xl font-bold tracking-tight">
                        {exp.role}
                      </CardTitle>
                      <div className="text-sm md:text-base font-medium text-muted-foreground">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-2.5 md:flex-row-reverse font-mono text-xs shrink-0",
                        exp.is_current ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span className="relative flex size-2 shrink-0">
                        {exp.is_current && (
                          <span className="absolute inset-0 rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                        )}
                        <span
                          className={cn(
                            "relative size-2 rounded-full",
                            exp.is_current
                              ? "bg-emerald-500"
                              : "border border-muted-foreground/50 bg-card"
                          )}
                        />
                      </span>
                      <span>
                        {exp.start_date} – {exp.is_current ? "Present" : exp.end_date || "Present"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {exp.bullets.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {exp.tech_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.tech_tags.map((tag) => {
                        const matched = skillLookup.get(tag.toLowerCase());
                        return (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="gap-1.5 text-xs font-normal text-muted-foreground bg-secondary/40 border-transparent"
                          >
                            {matched?.icon && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={matched.icon}
                                alt=""
                                className="w-3.5 h-3.5 object-contain grayscale opacity-65 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                              />
                            )}
                            {matched?.name || tag}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
