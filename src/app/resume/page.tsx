import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPortfolioPayload } from "@/lib/data";
import ResumePrintButton from "@/components/resume/resume-print-button";

export const metadata: Metadata = {
  title: "Resume",
  description: "Résumé of Fahim H. Mihad — view online or download PDF.",
};

export default async function ResumePage() {
  const { profile, experiences, skills, projects } = await getPortfolioPayload();

  return (
    <div className="min-h-screen font-sans pt-24 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>

          <div className="flex items-center gap-2">
            {profile.resume_url ? (
              <Button asChild>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            ) : (
              <ResumePrintButton />
            )}
          </div>
        </div>

        {profile.resume_url ? (
          <div className="aspect-[210/297] w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
            <iframe
              src={`${profile.resume_url}#toolbar=0&navpanes=0&view=FitH`}
              title={`${profile.name} — Résumé`}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-xl space-y-8 print:border-0 print:shadow-none print:p-0">
            <header className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground mt-1 text-base">{profile.title}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground md:items-end">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <Mail className="size-3.5" />
                  {profile.email}
                </a>
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {profile.location}
                  </span>
                )}
              </div>
            </header>

            {profile.bio && (
              <section className="space-y-2">
                <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                  Summary
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                  {profile.bio}
                </p>
              </section>
            )}

            {experiences.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                  Experience
                </h2>
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="space-y-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base font-bold">{exp.role}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exp.company}
                            {exp.location ? ` · ${exp.location}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                  Technical Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s.id} variant="secondary" className="font-normal">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                  Selected Projects
                </h2>
                <div className="space-y-3">
                  {projects.slice(0, 4).map((p) => (
                    <div key={p.id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        <span className="text-xs text-muted-foreground">{p.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.tagline}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <p className="text-xs text-muted-foreground pt-4 border-t border-border print:hidden">
              Tip: Upload a custom PDF résumé in{" "}
              <Link href="/admin/profile" className="underline text-foreground">
                Admin → Profile
              </Link>{" "}
              to embed it directly here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
