"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Search, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import type { NewsletterSubscriber } from "@/types/database";
import { formatDateShort, toCsvCell } from "@/lib/utils";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [resendConfigured, setResendConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((json: { data?: NewsletterSubscriber[]; resendConfigured?: boolean }) => {
        setSubscribers(json.data ?? []);
        setResendConfigured(Boolean(json.resendConfigured));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) => s.email.toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q)
    );
  }, [subscribers, query]);

  const exportCsv = () => {
    const header = ["Email", "Name", "Status", "Joined"].join(",");
    const rows = filtered.map((s) =>
      [s.email, s.name || "", s.status, s.created_at].map(toCsvCell).join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/newsletter?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Subscriber removed");
    }
    setDeleteTarget(null);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const json = (await res.json()) as { error?: string; sent?: number };
      if (!res.ok) throw new Error(json.error || "Send failed");
      toast.success(`Newsletter sent to ${json.sent} subscribers!`);
      setSubject("");
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Newsletter</h1>
          <p className="text-sm text-muted-foreground">
            {subscribers.length} total subscribers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      {/* Broadcast Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Broadcast (Resend)</CardTitle>
          <CardDescription>
            {resendConfigured
              ? "Resend is configured and ready to send to active subscribers."
              : "Add RESEND_API_KEY in Vercel environment variables to enable one-click broadcasts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Monthly update from Fahim H. Mihad"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message Body</Label>
              <Textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter message..."
                required
              />
            </div>
            <Button type="submit" disabled={sending || !resendConfigured} className="gap-2">
              <Send className="size-4" />
              {sending ? "Sending..." : "Send to All Active Subscribers"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscriber List */}
      <div className="relative max-w-sm">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter subscribers..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <Skeleton className="h-44 w-full" />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No subscribers yet.</Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{sub.email}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {sub.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sub.name ? `${sub.name} · ` : ""}Joined {formatDateShort(sub.created_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(sub)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Remove ${deleteTarget?.email}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
