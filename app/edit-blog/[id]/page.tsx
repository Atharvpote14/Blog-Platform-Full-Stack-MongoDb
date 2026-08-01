"use client";

import { PenLine, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BlogForm } from "@/components/BlogForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageLoader } from "@/components/Loading";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { getErrorMessage } from "@/utils/format";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await blogsApi.getBlog(params.id);
      setBlog(data);
      if (user) {
        const authorId =
          typeof data.author === "string" ? data.author : data.author._id;
        if (authorId !== user._id) setForbidden(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (user) load();
  }, [load, user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogsApi.deleteBlog(params.id);
      toast.success("Blog deleted successfully");
      router.push("/blogs");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <PageLoader />;

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="Blog not found"
            description="This post may have been deleted."
            actionLabel="Back to Blogs"
            actionHref="/blogs"
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (forbidden) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="You can't edit this post"
            description="Only the author of this post can edit or delete it."
            actionLabel="Back to Blogs"
            actionHref="/blogs"
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-glow">
            <PenLine className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">
              Edit <span className="gradient-text">post</span>
            </h1>
            <p className="text-muted">Refine your words, then publish again.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Post
          </Button>
        </div>

        {blog && <BlogForm mode="edit" blog={blog} />}

        <ConfirmDialog
          open={confirmOpen}
          title="Delete this post?"
          description="This will permanently delete the blog and all its comments. This action cannot be undone."
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
