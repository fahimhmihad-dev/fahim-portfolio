"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact-form";
import { SectionHeader } from "./section-header";
import SectionWrapper from "@/components/ui/section-wrapper";
import type { Profile } from "@/types/database";

export default function ContactSection({ profile }: { profile: Profile }) {
  const whatsappUrl = profile.socials?.whatsapp || "http://wa.me/+8801522125856";

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
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="font-display text-2xl md:text-3xl">Contact Form</CardTitle>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-can-hover"
                >
                  <FaWhatsapp className="size-4 shrink-0" />
                  <span>WhatsApp: +880 1522-125856</span>
                </a>
              )}
            </div>
            <CardDescription className="leading-relaxed">
              Please contact me directly at{" "}
              <a
                href={`mailto:${profile.email}`}
                className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 cursor-can-hover rounded"
              >
                {profile.email.replace(/@/g, "(at)")}
              </a>
              {whatsappUrl && (
                <>
                  {" "}
                  or on{" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 cursor-can-hover rounded"
                  >
                    WhatsApp
                  </a>
                </>
              )}{" "}
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
