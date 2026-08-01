"use client";

import { motion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlogGrid } from "@/components/BlogGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState } from "@/components/EmptyState";
import { BlogGridSkeleton } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Liked" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function BlogsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as SortValue) ?? "latest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, String(value));
      });
      router.replace(`/blogs?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await blogsApi.getBlogs({ search, category, sort, page, limit: 9 });
      setBlogs(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      if (allCategories.length === 0) {
        const allRes = await blogsApi.getBlogs({ limit: 50 });
        setAllCategories(
          Array.from(new Set(allRes.data.map((b) => b.category).filter(Boolean)))
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, allCategories.length]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = useCallback(
    (value: string) => updateParams({ search: value || null, page: null }),
    [updateParams]
  );

  const handleCategory = useCallback(
    (value: string) => updateParams({ category: value || null, page: null }),
    [updateParams]
  );

  const handleSort = useCallback(
    (value: SortValue) => updateParams({ sort: value || null, page: null }),
    [updateParams]
  );

  const handlePage = useCallback(
    (value: number) => updateParams({ page: value === 1 ? null : value }),
    [updateParams]
  );

  const activeFilters = useMemo(
    () => Boolean(search || category || sort !== "latest" || page !== 1),
    [search, category, sort, page]
  );

  const resetFilters = () => router.replace("/blogs");

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Discover
        </p>
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">
          All <span className="gradient-text">Blogs</span>
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Search, filter, and explore stories from writers around the world.
        </p>
      </motion.div>

      <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="w-full max-w-xl">
          <SearchBar value={search} onChange={handleSearch} />
        </div>
        <div className="relative">
          <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortValue)}
            aria-label="Sort blogs"
            className="h-12 appearance-none rounded-2xl border border-line bg-card pl-11 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {allCategories.length > 0 && (
        <div className="mb-10">
          <CategoryFilter
            categories={allCategories}
            active={category}
            onSelect={handleCategory}
          />
        </div>
      )}

      {loading ? (
        <BlogGridSkeleton count={9} />
      ) : error ? (
        <div className="text-center">
          <EmptyState
            title="Couldn't load blogs"
            description="Make sure the backend server is running, then try again."
            actionLabel="Retry"
            onAction={load}
          />
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No blogs found"
          description="Try adjusting your search or filters, or be the first to write about this topic."
          actionLabel={activeFilters ? "Clear Filters" : "Create a Post"}
          onAction={activeFilters ? resetFilters : undefined}
          actionHref={activeFilters ? undefined : "/create-blog"}
        />
      ) : (
        <>
          <p className="mb-6 text-center text-sm text-muted">
            Showing {blogs.length} of {total} {total === 1 ? "post" : "posts"}
          </p>
          <BlogGrid blogs={blogs} />
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePage}
            />
          </div>
        </>
      )}
    </div>
  );
}
