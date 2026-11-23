"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { AceInput } from "@/components/ui/ace-input";
import { AceTextarea } from "@/components/ui/ace-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>;

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = formSchema.safeParse({ fullName, email, message });
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FieldErrors;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          message: parsed.data.message,
          website,
          startedAt: mountedAt.current,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      toast.success("Thank you! Your message has been sent.");
      setFullName("");
      setEmail("");
      setMessage("");
      setWebsite("");
      mountedAt.current = Date.now();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mx-auto sm:mt-4" onSubmit={handleSubmit} aria-busy={loading} noValidate>
      {/* Hidden honeypot field for spam bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <LabelInputContainer>
          <Label htmlFor="fullname">Full name</Label>
          <AceInput
            id="fullname"
            placeholder="Your Name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((p) => ({ ...p, fullName: undefined }));
            }}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="email">Email Address</Label>
          <AceInput
            id="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </LabelInputContainer>
      </div>

      <div className="grid w-full gap-1.5 mb-5">
        <Label htmlFor="contact-message">Your Message</Label>
        <AceTextarea
          id="contact-message"
          placeholder="Tell me about your project..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setErrors((p) => ({ ...p, message: undefined }));
          }}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
        <p className="text-xs text-muted-foreground">
          I&apos;ll never share your data with anyone else. Pinky promise!
        </p>
      </div>

      <Button
        disabled={loading}
        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-700 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
        type="submit"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send Message
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </span>
        )}
        <BottomGradient />
      </Button>
    </form>
  );
}

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
}

function BottomGradient() {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-brand to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
    </>
  );
}
