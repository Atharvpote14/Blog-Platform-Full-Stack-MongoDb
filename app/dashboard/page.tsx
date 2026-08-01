"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Heart,
  LayoutDashboard,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { BlogGridSkeleton, Skeleton } from "@/components/Loading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { formatCount, formatDate, getErrorMessage } from "@/utils/format";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [platformTotal, setPlatformTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [mine, recent, platform] = await Promise.all([
        blogsApi.getMyBlogs(user._id),
        blogsApi.getBlogs({ sort: "latest", limit: 5 }),
        blogsApi.getBlogs({ limit: 1 }),
      ]);
      setMyBlogs(mine);
      setRecentBlogs(recent.data);
      setPlatformTotal(platform.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const totalLikes = myBlogs.reduce((sum, blog) => sum + blog.likes.length, 0);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await blogsApi.deleteBlog(deleteTarget._id);
      setMyBlogs((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      toast.success("Blog deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const quickActions = [
    { label: "New Post", href: "/create-blog", icon: PenLine },
    { label: "Browse Blogs", href: "/blogs", icon: BookOpen },
    { label: "Profile", href: "/profile", icon: LayoutDashboard },
  ];

  const stats = [
    { label: "My Posts", value: myBlogs.length, icon: PenLine },
    { label: "Total Likes", value: totalLikes, icon: Heart },
    { label: "Platform Posts", value: platformTotal, icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl gradient-bg p-8 shadow-glow"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <h1 className="mb-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {greeting()}, {user?.name.split(" ")[0]}!
        </h1>
        <p className="max-w-md text-sm text-white/80">
          Here&apos;s what&apos;s happening with your writing today.
        </p>
        <div className="mt-5">
          <Button
            href="/create-blog"
            className="!bg-white !text-primary hover:!shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Write a new post
          </Button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Statistics"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="glass card-hover rounded-2xl p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-bg shadow-glow">
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass card-hover group flex items-center justify-between rounded-2xl p-5"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <action.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{action.label}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </motion.section>

      <section aria-label="My blogs" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">My Blogs</h2>
          <Link
            href="/create-blog"
            className="text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            + New
          </Link>
        </div>

        {loading ? (
          <BlogGridSkeleton count={3} />
        ) : myBlogs.length === 0 ? (
          <EmptyState
            title="You haven&apos;t written anything yet"
            description="Start your first post and share your ideas with the world."
            actionLabel="Create a Post"
            actionHref="/create-blog"
          />
        ) : (
          <div className="space-y-3">
            {myBlogs.slice(0, 5).map((blog, i) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <Link
                  href={`/blogs/${blog._id}`}
                  className="min-w-0 flex-1"
                  aria-label={`Open ${blog.title}`}
                >
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold hover:text-primary">
                      {blog.title}
                    </p>
                    <Badge className="hidden sm:inline-flex">{blog.category}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(blog.createdAt)} ·{" "}
                    <span className="inline-flex items-center gap-0.5 text-danger">
                      <Heart className="h-3 w-3" />
                      {formatCount(blog.likes.length)}
                    </span>
                  </p>
                </Link>
                <div className="flex shrink-0 gap-2">
                  <Button
                    href={`/edit-blog/${blog._id}`}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-danger hover:!bg-danger/10"
                    onClick={() => setDeleteTarget(blog)}
                    aria-label={`Delete ${blog.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Recent blogs">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent from the Community</h2>
          <Link
            href="/blogs"
            className="text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentBlogs.slice(0, 4).map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog._id}`}
                className="glass card-hover flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold hover:text-primary">
                    {blog.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {typeof blog.author === "string"
                      ? "Unknown"
                      : blog.author.name}{" "}
                    · {formatDate(blog.createdAt)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this blog?"
        description={`"${deleteTarget?.title}" and all its comments will be permanently removed.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
