import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ScrollProgress from "@/components/ui/scroll-progress";
import RevealAnimation from "@/components/reveal-animations";
import { getPublishedBlogPostBySlug } from "@/lib/data";
import { estimateReadTime, formatDateLong } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.summary,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.summary,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      images: post.seo_og_image || post.cover_url ? [post.seo_og_image || post.cover_url!] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const readTime = estimateReadTime(post.content);

  return (
    <div className="min-h-screen relative font-sans">
      <ScrollProgress className="bg-gradient-to-r from-[hsl(20,100%,70%)] to-[hsl(30,100%,65%)]" />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(20,100%,70%)]/[0.04] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-24 max-w-[740px]">
        <RevealAnimation>
          <Link
            href="/blogs"
            className="inline-flex items-center text-muted-foreground hover:text-[hsl(20,100%,70%)] transition-colors mb-10 group text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            All posts
          </Link>
        </RevealAnimation>

        <RevealAnimation delay={0.08}>
          <header className="mb-10">
            {post.tags.length > 0 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-[hsl(20,100%,70%)]/25 text-[hsl(20,100%,70%)] bg-[hsl(20,100%,70%)]/5 rounded-full px-3 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="font-display text-2xl md:text-4xl leading-[1.14] tracking-tight mb-7">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pb-7 border-b border-border/60">
              {post.author && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(20,100%,70%)]/15 flex items-center justify-center">
                    <User className="w-3 h-3 text-[hsl(20,100%,70%)]" />
                  </div>
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{formatDateLong(post.published_at || post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} min read</span>
              </div>
            </div>
          </header>
        </RevealAnimation>

        {post.cover_url && (
          <RevealAnimation delay={0.12}>
            <div className="mb-10 overflow-hidden rounded-2xl border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_url} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          </RevealAnimation>
        )}

        <RevealAnimation delay={0.15}>
          <article className="space-y-6 text-[16.5px] leading-[1.85] text-muted-foreground [&_h1]:font-display [&_h1]:text-2xl [&_h1]:text-foreground [&_h1]:mt-12 [&_h1]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[hsl(20,100%,70%)] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-foreground/85 [&_code]:bg-muted [&_code]:text-[hsl(20,100%,65%)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border/60 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-[hsl(20,100%,70%)] [&_a]:underline [&_a]:underline-offset-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>
        </RevealAnimation>

        <div className="mt-16 pt-8 border-t border-border/60">
          <Link
            href="/blogs"
            className="inline-flex items-center text-muted-foreground hover:text-[hsl(20,100%,70%)] transition-colors group text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
