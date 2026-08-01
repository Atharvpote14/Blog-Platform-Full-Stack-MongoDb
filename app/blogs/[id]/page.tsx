"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Lock,
  PenLine,
  Share2,
  Trash2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CommentSection } from "@/components/CommentSection";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Loading";
import { LikeButton } from "@/components/LikeButton";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { resolveImageUrl } from "@/lib/images";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { formatDate, getErrorMessage, readingTime } from "@/utils/format";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await blogsApi.getBlog(params.id);
      setBlog(data);
    } catch (error) {
      setNotFound(true);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: blog?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Could not share this post");
    }
  };

  const handleDelete = async () => {
    if (!blog) return;
    setDeleting(true);
    try {
      await blogsApi.deleteBlog(blog._id);
      toast.success("Blog deleted successfully");
      router.push("/blogs");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <BlogDetailSkeleton />;

  if (notFound || !blog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Blog not found"
          description="This post may have been deleted, set to private, or the link is incorrect."
          actionLabel="Back to Blogs"
          actionHref="/blogs"
        />
      </div>
    );
  }

  const isAuthor =
    !!user &&
    (typeof blog.author === "string"
      ? blog.author === user._id
      : blog.author._id === user._id);
  const authorName =
    typeof blog.author === "string" ? "Unknown Author" : blog.author.name;
  const authorAvatar =
    typeof blog.author === "string" ? undefined : blog.author.avatar;
  const coverImage = resolveImageUrl(blog.coverImage);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6"
    >
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge gradient>{blog.category}</Badge>
        {blog.visibility === "private" && (
          <Badge className="border-warning/40 bg-warning/10 text-warning">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        )}
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <CalendarDays className="h-4 w-4" />
          {formatDate(blog.createdAt)}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4" />
          {readingTime(blog.content)}
        </span>
      </div>

      <h1 className="mb-8 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {blog.title}
      </h1>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
        <div className="flex items-center gap-3">
          <UserAvatar name={authorName} avatar={authorAvatar} size="md" />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <UserRound className="h-3.5 w-3.5 text-muted" />
              {authorName}
            </p>
            <p className="text-xs text-muted">
              Member since {blog.createdAt ? formatDate(blog.createdAt) : "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAuthor && (
            <>
              <Button
                href={`/edit-blog/${blog._id}`}
                variant="secondary"
                size="md"
              >
                <PenLine className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="!text-danger hover:!bg-danger/10"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          <LikeButton blogId={blog._id} initialLikes={blog.likes} />
          <Button variant="secondary" size="md" onClick={handleShare} aria-label="Share this post">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {coverImage && (
        <div className="mb-10 overflow-hidden rounded-3xl border border-line shadow-glow">
          <Image
            src={coverImage}
            alt={blog.title}
            width={1200}
            height={675}
            priority
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <div className="whitespace-pre-wrap text-base leading-8 text-foreground/90 sm:text-lg sm:leading-9">
        {blog.content}
      </div>

      <div className="mt-12 flex items-center justify-center border-t border-line pt-10">
        <LikeButton blogId={blog._id} initialLikes={blog.likes} />
      </div>

      <CommentSection blogId={blog._id} initialComments={blog.comments} />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this post?"
        description="This will permanently delete the blog and all its comments. This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </motion.article>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Skeleton className="mb-8 h-9 w-24" />
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36" />
      </div>
      <Skeleton className="mb-4 h-12 w-full" />
      <Skeleton className="mb-10 h-12 w-2/3" />
      <div className="mb-10 flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mb-4 aspect-video w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/6" />
      </div>
    </div>
  );
}
