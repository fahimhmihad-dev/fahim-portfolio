"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AceInput } from "@/components/ui/ace-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  name: z.string().trim().max(120).optional(),
});

export default function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email, name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          name: parsed.data.name || "",
          website,
          startedAt: mountedAt.current,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.error || "Subscription failed.");

      setSubscribed(true);
      setEmail("");
      setName("");
      toast.success(data.message || "You're subscribed!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not subscribe.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="font-display text-lg font-bold">You&apos;re on the list!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Thanks for subscribing. Expect occasional notes on software engineering, architecture, and
          new launches — zero spam.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubscribed(false)} className="mt-2">
          Subscribe another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="news-website">Website</label>
        <input
          id="news-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="news-name">First name (optional)</Label>
        <AceInput
          id="news-name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="news-email">Email address</Label>
        <AceInput
          id="news-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 font-medium">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            Join Newsletter
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No spam, ever. Unsubscribe anytime with one click.
      </p>
    </form>
  );
}
