"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { blogsApi } from "@/services/blogs";
import type { Comment } from "@/types";
import { formatDate, getErrorMessage } from "@/utils/format";

const commentSchema = z.object({
  text: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  blogId: string;
  initialComments?: Comment[];
}

export function CommentSection({ blogId, initialComments = [] }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  });

  const onSubmit = async (values: CommentFormValues) => {
    if (!user) return;
    try {
      const comment = await blogsApi.addComment(blogId, values.text);
      setComments((prev) => [comment, ...prev]);
      reset();
      toast.success("Comment added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await blogsApi.deleteComment(deleteTarget._id);
      setComments((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      toast.success("Comment deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="mt-10" aria-label="Comments">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments ({comments.length})
      </h2>

      {user ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass mb-8 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
            <div className="flex-1 space-y-3">
              <TextArea
                placeholder="Share your thoughts…"
                rows={3}
                error={errors.text?.message}
                {...register("text")}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={isSubmitting}
                  disabled={!user}
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="glass mb-8 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted">
            <a href="/login" className="font-semibold text-primary hover:underline">
              Login
            </a>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Be the first to share your thoughts on this post."
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-4"
        >
          {comments.map((comment) => {
            const authorName =
              typeof comment.author === "string" ? "User" : comment.author.name;
            const authorAvatar =
              typeof comment.author === "string" ? undefined : comment.author.avatar;
            const isOwn =
              user && typeof comment.author !== "string"
                ? comment.author._id === user._id
                : false;

            return (
              <motion.div
                key={comment._id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                className="glass flex items-start gap-3 rounded-2xl p-4"
              >
                <UserAvatar name={authorName} avatar={authorAvatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{authorName}</p>
                      <span className="text-xs text-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {isOwn && (
                      <button
                        suppressHydrationWarning
                        onClick={() => setDeleteTarget(comment)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {comment.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete comment?"
        description="This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
