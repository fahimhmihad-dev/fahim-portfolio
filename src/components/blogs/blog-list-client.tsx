"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowUpRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { BlogPost } from "@/types/database";
import { estimateReadTime, formatDateShort } from "@/lib/utils";

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen font-sans relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(20,100%,70%)]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(20,100%,70%)]/4 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[60px] bg-[hsl(20,100%,70%)]" />
            <span className="text-[hsl(20,100%,70%)] text-sm font-medium tracking-[0.2em] uppercase">
              Blog
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl leading-[0.98] tracking-tight">
            Thoughts &amp;
            <br />
            <span className="text-[hsl(20,100%,70%)]">Dispatches</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
            Notes on engineering, building products, and sharing lessons learned along the way.
          </p>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="mb-14"
          >
            <Link href={`/blogs/${featured.slug}`} className="group block">
              <div className="relative border border-border/60 rounded-2xl p-7 md:p-11 overflow-hidden transition-colors hover:border-[hsl(20,100%,70%)]/40 bg-card/45 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[hsl(20,100%,70%)]/10 to-transparent rounded-bl-full" />

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-5 text-xs md:text-sm text-muted-foreground">
                    <span className="text-[hsl(20,100%,70%)] font-medium tracking-[0.15em] uppercase text-xs">
                      Featured
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDateShort(featured.published_at || featured.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {estimateReadTime(featured.content)} min read
                    </span>
                  </div>

                  <h2 className="font-display text-2xl md:text-3xl leading-[1.18] mb-4 group-hover:text-[hsl(20,100%,70%)] transition-colors duration-300">
                    {featured.title}
                  </h2>

                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mb-7">
                    {featured.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                      {featured.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-[hsl(20,100%,70%)]/25 text-[hsl(20,100%,70%)] bg-[hsl(20,100%,70%)]/5 rounded-full px-3"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-[hsl(20,100%,70%)] transition-colors">
                      Read article
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {rest.length > 0 && (
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-14" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 + index * 0.08 }}
            >
              <Link href={`/blogs/${post.slug}`} className="group block h-full">
                <div className="h-full flex flex-col border border-border/60 rounded-xl p-6 md:p-8 transition-all duration-300 hover:border-[hsl(20,100%,70%)]/35 hover:bg-card/55 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3" />
                      {formatDateShort(post.published_at || post.created_at)}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {estimateReadTime(post.content)} min read
                    </span>
                  </div>

                  <h3 className="font-display text-lg md:text-xl leading-tight mb-3 group-hover:text-[hsl(20,100%,70%)] transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {post.summary}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-border/60 text-muted-foreground text-[10px] rounded-full px-2.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(20,100%,70%)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-lg">No published articles yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
