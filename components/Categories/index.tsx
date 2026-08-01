"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/Loading";
import { blogsApi } from "@/services/blogs";
import { cn } from "@/utils/cn";

export function Categories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await blogsApi.getBlogs({ limit: 50 });
      const unique = Array.from(
        new Set(res.data.map((blog) => blog.category).filter(Boolean))
      );
      setCategories(unique.slice(0, 8));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="py-20" aria-label="Browse by category">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Explore topics
          </p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Browse by <span className="gradient-text">Category</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-32 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted">
            No categories yet — publish your first post to get started.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, i) => (
              <Link
                key={category}
                href={`/blogs?category=${encodeURIComponent(category)}`}
                className={cn(
                  "glass card-hover flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold",
                  i % 3 === 1
                    ? "hover:border-secondary/50"
                    : "hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i % 3 === 0
                      ? "bg-primary"
                      : i % 3 === 1
                      ? "bg-secondary"
                      : "bg-success"
                  )}
                />
                {category}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
