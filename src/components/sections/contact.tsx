"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact-form";
import { SectionHeader } from "./section-header";
import SectionWrapper from "@/components/ui/section-wrapper";
import type { Profile } from "@/types/database";

export default function ContactSection({ profile }: { profile: Profile }) {
  return (
    <SectionWrapper id="contact" className="min-h-screen max-w-7xl mx-auto px-4 py-24">
      <SectionHeader
        id="contact"
        className="static mb-12 md:mb-16"
        title={
          <>
            LET&apos;S WORK <br />
            TOGETHER
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 items-start">
        <Card className="pointer-events-auto bg-white/85 dark:bg-black/75 backdrop-blur-md rounded-xl border-border/80 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-2xl md:text-3xl">Contact Form</CardTitle>
            <CardDescription className="leading-relaxed">
              Please contact me directly at{" "}
              <a
                href={`mailto:${profile.email}`}
                className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 cursor-can-hover rounded"
              >
                {profile.email.replace(/@/g, "(at)")}
              </a>{" "}
              or drop your info here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <div className="hidden md:block" />
      </div>
    </SectionWrapper>
  );
}
