"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Newspaper,
  FileText,
  FolderKanban,
  Cpu,
  Briefcase,
  ArrowRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContactMessage } from "@/types/database";
import { formatDateShort } from "@/lib/utils";

interface OverviewData {
  stats: {
    messagesTotal: number;
    messagesUnread: number;
    subscribersTotal: number;
    postsPublished: number;
    postsDraft: number;
    projectsTotal: number;
    skillsTotal: number;
    experiencesTotal: number;
  };
  recentMessages: ContactMessage[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((json: OverviewData) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage every section of your 3D portfolio. Changes publish instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/" target="_blank">
              <ExternalLink className="size-3.5" /> Live Site
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/projects">
              <Plus className="size-3.5" /> Add Project
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/blog">
              <Plus className="size-3.5" /> New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="Messages"
              value={data.stats.messagesTotal}
              subtitle={`${data.stats.messagesUnread} unread`}
              icon={<Mail className="size-4 text-sky-500" />}
              href="/admin/messages"
            />
            <StatCard
              title="Subscribers"
              value={data.stats.subscribersTotal}
              subtitle="Active newsletter list"
              icon={<Newspaper className="size-4 text-emerald-500" />}
              href="/admin/newsletter"
            />
            <StatCard
              title="Blog Posts"
              value={data.stats.postsPublished}
              subtitle={`${data.stats.postsDraft} drafts`}
              icon={<FileText className="size-4 text-orange-500" />}
              href="/admin/blog"
            />
            <StatCard
              title="Projects"
              value={data.stats.projectsTotal}
              subtitle={`${data.stats.skillsTotal} skills · ${data.stats.experiencesTotal} roles`}
              icon={<FolderKanban className="size-4 text-purple-500" />}
              href="/admin/projects"
            />
          </>
        )}
      </div>

      {/* Quick Actions + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <CardDescription>Latest inquiries from your contact form</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/messages" className="gap-1 text-xs">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : !data?.recentMessages.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No contact messages yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {data.recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="flex items-start justify-between gap-4 py-3 hover:bg-muted/40 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{msg.name}</span>
                        {msg.status === "unread" && (
                          <Badge className="text-[10px] px-1.5 py-0">Unread</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatDateShort(msg.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Shortcuts</CardTitle>
            <CardDescription>Jump right into content editing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { href: "/admin/profile", label: "Edit Hero & Bio", icon: Briefcase },
              { href: "/admin/skills", label: "Customize 3D Keyboard Keys", icon: Cpu },
              { href: "/admin/experience", label: "Update Experience Timeline", icon: Briefcase },
              { href: "/admin/media", label: "Upload Images or PDF Resume", icon: FolderKanban },
              { href: "/admin/settings", label: "SEO, Toggles & Maintenance", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/40 transition-colors h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
