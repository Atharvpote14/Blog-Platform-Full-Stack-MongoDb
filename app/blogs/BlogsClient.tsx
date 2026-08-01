"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Globe, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlogGrid } from "@/components/BlogGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState } from "@/components/EmptyState";
import { BlogGridSkeleton } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { cn } from "@/utils/cn";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Liked" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type ViewValue = "public" | "mine";

const SELECT_OPTIONS = [
  ...SORT_OPTIONS,
  { value: "private", label: "Private" },
] as const;

const VIEW_TABS: { value: ViewValue; label: string; icon: typeof Globe }[] = [
  { value: "public", label: "Public Blogs", icon: Globe },
  { value: "mine", label: "My Blogs", icon: Lock },
];

export function BlogsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const view: ViewValue = searchParams.get("view") === "mine" ? "mine" : "public";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as SortValue) ?? "latest";
  const privateOnly = searchParams.get("visibility") === "private";
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
      const res = await blogsApi.getBlogs({
        search,
        category,
        sort,
        page,
        limit: 9,
        author: view === "mine" && user ? user._id : undefined,
        visibility: privateOnly ? "private" : undefined,
      });
      setBlogs(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      if (allCategories.length === 0) {
        const allRes = await blogsApi.getBlogs({
          limit: 50,
          author: view === "mine" && user ? user._id : undefined,
          visibility: privateOnly ? "private" : undefined,
        });
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
  }, [search, category, sort, page, view, privateOnly, user, allCategories.length]);

  useEffect(() => {
    setAllCategories([]);
  }, [view, privateOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = useCallback(
    (value: ViewValue) =>
      updateParams({ view: value === "mine" ? "mine" : null, page: null }),
    [updateParams]
  );

  const handleSearch = useCallback(
    (value: string) => updateParams({ search: value || null, page: null }),
    [updateParams]
  );

  const handleCategory = useCallback(
    (value: string) => updateParams({ category: value || null, page: null }),
    [updateParams]
  );

  const handleSort = useCallback(
    (value: SortValue | "private") => {
      if (value === "private") {
        updateParams({ visibility: "private", page: null });
      } else {
        updateParams({ visibility: null, sort: value || null, page: null });
      }
    },
    [updateParams]
  );

  const handlePage = useCallback(
    (value: number) => updateParams({ page: value === 1 ? null : value }),
    [updateParams]
  );

  const activeFilters = useMemo(
    () =>
      Boolean(
        search || category || privateOnly || sort !== "latest" || page !== 1
      ),
    [search, category, privateOnly, sort, page]
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
          {view === "mine" ? (
            <>
              My <span className="gradient-text">Blogs</span>
            </>
          ) : (
            <>
              All <span className="gradient-text">Blogs</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          {view === "mine"
            ? "Your personal space — public posts and private drafts only you can see."
            : "Search, filter, and explore stories from writers around the world."}
        </p>
      </motion.div>

      <div className="mb-8 flex flex-col items-center gap-6">
        <div
          className="glass flex rounded-2xl p-1"
          role="tablist"
          aria-label="Blog view"
        >
          {VIEW_TABS.map((tab) => {
            const isActive = view === tab.value;
            return (
              <button
                suppressHydrationWarning
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleView(tab.value)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
                  isActive ? "text-white" : "text-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="blog-view-active"
                    className="absolute inset-0 rounded-xl gradient-bg shadow-glow"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {view === "mine" && !user && (
          <EmptyState
            title="Sign in to see your blogs"
            description="Your private and public posts live here. Log in to view them."
            actionLabel="Login"
            actionHref="/login"
          />
        )}

        {privateOnly && !user && (
          <EmptyState
            title="Sign in to see private posts"
            description="Your private posts are only visible to you. Log in to view them."
            actionLabel="Login"
            actionHref="/login"
          />
        )}
      </div>

      {!(view === "mine" && !user) && !(privateOnly && !user) && (
        <>
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="w-full max-w-xl">
              <SearchBar value={search} onChange={handleSearch} />
            </div>
            <div className="relative">
              <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={privateOnly ? "private" : sort}
                onChange={(e) =>
                  handleSort(e.target.value as SortValue | "private")
                }
                aria-label="Sort or filter blogs"
                className="h-12 appearance-none rounded-2xl border border-line bg-card pl-11 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              >
                {SELECT_OPTIONS.map((option) => (
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
              title={
                view === "mine"
                  ? "No posts yet"
                  : privateOnly
                    ? "No private posts yet"
                    : "No blogs found"
              }
              description={
                view === "mine"
                  ? "Write your first post — it will show up here, and public ones in the Public Blogs tab."
                  : privateOnly
                    ? "When you create a post and set it to Private, it will appear here — only you can see it."
                    : "Try adjusting your search or filters, or be the first to write about this topic."
              }
              actionLabel={
                view === "mine" || privateOnly
                  ? "Create a Post"
                  : activeFilters
                    ? "Clear Filters"
                    : "Create a Post"
              }
              onAction={
                view === "mine" || privateOnly
                  ? undefined
                  : activeFilters
                    ? resetFilters
                    : undefined
              }
              actionHref={view === "mine" || privateOnly || !activeFilters ? "/create-blog" : undefined}
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
        </>
      )}
    </div>
  );
}
