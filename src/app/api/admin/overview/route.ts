import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const [
    messagesTotal,
    messagesUnread,
    subscribersTotal,
    postsPublished,
    postsDraft,
    projectsTotal,
    skillsTotal,
    experiencesTotal,
    recentMessages,
  ] = await Promise.all([
    admin.supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    admin.supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread"),
    admin.supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin.supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    admin.supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    admin.supabase.from("projects").select("*", { count: "exact", head: true }),
    admin.supabase.from("skills").select("*", { count: "exact", head: true }),
    admin.supabase.from("experiences").select("*", { count: "exact", head: true }),
    admin.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    stats: {
      messagesTotal: messagesTotal.count ?? 0,
      messagesUnread: messagesUnread.count ?? 0,
      subscribersTotal: subscribersTotal.count ?? 0,
      postsPublished: postsPublished.count ?? 0,
      postsDraft: postsDraft.count ?? 0,
      projectsTotal: projectsTotal.count ?? 0,
      skillsTotal: skillsTotal.count ?? 0,
      experiencesTotal: experiencesTotal.count ?? 0,
    },
    recentMessages: recentMessages.data ?? [],
  });
}
