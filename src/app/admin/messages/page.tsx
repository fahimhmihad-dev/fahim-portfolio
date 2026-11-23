"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Archive, Check, Download, Mail, MailOpen, Reply, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import type { ContactMessage, MessageStatus } from "@/types/database";
import { formatDateShort, toCsvCell } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | MessageStatus>("all");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((json: { data?: ContactMessage[] }) => setMessages(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, query]);

  const updateStatus = async (msg: ContactMessage, status: MessageStatus) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, status }),
    });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status } : m)));
      toast.success(`Marked as ${status}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/messages?id=${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success("Message deleted");
    }
    setDeleteTarget(null);
  };

  const exportCsv = () => {
    const header = ["Date", "Name", "Email", "Status", "Message"].join(",");
    const rows = filtered.map((m) =>
      [m.created_at, m.name, m.email, m.status, m.message].map(toCsvCell).join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Messages Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {messages.filter((m) => m.status === "unread").length} unread · {messages.length} total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "unread", "read", "archived"] as const).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={filter === tab ? "default" : "outline"}
              onClick={() => setFilter(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No messages match the current filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <Card key={msg.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{msg.name}</span>
                    <Badge
                      variant={
                        msg.status === "unread"
                          ? "default"
                          : msg.status === "archived"
                            ? "outline"
                            : "secondary"
                      }
                      className="text-[10px] capitalize"
                    >
                      {msg.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {msg.email} · {formatDateShort(msg.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(
                        `Re: Your message to Fahim H. Mihad`
                      )}`}
                    >
                      <Reply className="size-3.5" /> Reply
                    </a>
                  </Button>
                  {msg.status !== "read" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateStatus(msg, "read")}
                      title="Mark read"
                    >
                      <MailOpen className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateStatus(msg, "unread")}
                      title="Mark unread"
                    >
                      <Mail className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateStatus(msg, msg.status === "archived" ? "read" : "archived")}
                    title={msg.status === "archived" ? "Unarchive" : "Archive"}
                  >
                    {msg.status === "archived" ? (
                      <Check className="size-4" />
                    ) : (
                      <Archive className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(msg)}
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/35 rounded-lg p-3">
                {msg.message}
              </p>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete message from ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
