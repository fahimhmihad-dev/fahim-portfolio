import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import NewsletterForm from "@/components/news/newsletter-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Subscribe for engineering notes, product launches, and dispatches from Fahim H. Mihad.",
};

export default async function NewsletterPage() {
  const profile = await getPublicProfile();

  return (
    <div className="min-h-screen relative font-sans">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(20,100%,70%)]/6 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sky-500/6 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-24 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-10 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to portfolio
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[60px] bg-[hsl(20,100%,70%)]" />
            <span className="text-[hsl(20,100%,70%)] text-sm font-medium tracking-[0.2em] uppercase">
              Newsletter
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl leading-[1.02] tracking-tight">
            Dispatches from
            <br />
            <span className="text-[hsl(20,100%,70%)]">{profile.name}</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-base md:text-lg leading-relaxed">
            Occasional write-ups on full-stack architecture, interactive web experiments, and new
            projects — sent directly to your inbox.
          </p>
        </div>

        <Card className="bg-card/75 backdrop-blur-md border-border/70 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-[hsl(20,100%,70%)] font-medium uppercase tracking-widest mb-1">
              <Sparkles className="size-3.5" />
              Direct to inbox
            </div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Mail className="size-5" />
              Subscribe
            </CardTitle>
            <CardDescription>
              Join readers following engineering notes and build logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsletterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
