import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/data";
import BlogListClient from "@/components/blogs/blog-list-client";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes, tutorials, and dispatches by Fahim H. Mihad.",
};

export default async function BlogsPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogListClient posts={posts} />;
}
