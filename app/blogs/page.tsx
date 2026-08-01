import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogsPageSkeleton } from "@/components/Loading";
import { BlogsClient } from "./BlogsClient";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Explore blogs on BlogSphere",
};

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogsPageSkeleton />}>
      <BlogsClient />
    </Suspense>
  );
}
