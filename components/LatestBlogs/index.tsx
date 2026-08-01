"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BlogGrid } from "@/components/BlogGrid";
import { BlogGridSkeleton } from "@/components/Loading";
import { Button } from "@/components/ui/Button";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { getErrorMessage } from "@/utils/format";
import { toast } from "sonner";

export function LatestBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogsApi.getBlogs({ sort: "latest", limit: 6 });
      setBlogs(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="py-20" aria-label="Latest blogs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Fresh off the press
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Latest <span className="gradient-text">Blogs</span>
            </h2>
          </div>
          <Button href="/blogs" variant="secondary">
            View All Blogs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <BlogGridSkeleton count={6} />
        ) : blogs.length === 0 ? (
          <p className="text-center text-muted">
            No blogs published yet. Be the first to write!
          </p>
        ) : (
          <BlogGrid blogs={blogs} />
        )}
      </div>
    </section>
  );
}
