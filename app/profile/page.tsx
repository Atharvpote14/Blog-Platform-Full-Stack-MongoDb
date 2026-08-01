"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CalendarDays, Camera, Loader2, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Loading";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { resolveImageUrl } from "@/lib/images";
import { blogsApi } from "@/services/blogs";
import { usersApi } from "@/services/users";
import type { Blog } from "@/types";
import { formatDate, getErrorMessage } from "@/utils/format";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Please enter a valid email"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const loadBlogs = useCallback(async () => {
    if (!user) return;
    try {
      const blogs = await blogsApi.getMyBlogs(user._id);
      setMyBlogs(blogs);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
      loadBlogs();
    }
  }, [user, reset, loadBlogs]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", user?.name ?? "");
      formData.append("email", user?.email ?? "");
      formData.append("avatar", file);
      const updated = await usersApi.updateProfile(formData);
      setUser(updated);
      setAvatarPreview("");
      toast.success("Profile photo updated");
    } catch (error) {
      setAvatarPreview("");
      toast.error(getErrorMessage(error));
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updated = await usersApi.updateProfile({
        name: values.name,
        email: values.email,
      });
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await usersApi.deleteProfile();
      toast.success("Account deleted");
      router.push("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!user) return <Skeleton className="h-64 w-full rounded-3xl" />;

  const totalLikes = myBlogs.reduce((sum, blog) => sum + blog.likes.length, 0);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 text-center"
        >
          <div className="relative mx-auto mb-4 w-fit">
            <UserAvatar
              name={user.name}
              avatar={avatarPreview || resolveImageUrl(user.avatar) || undefined}
              size="xl"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full gradient-bg text-white shadow-glow transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Change avatar"
            >
              {avatarUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
              aria-label="Upload avatar"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Member since {formatDate(user.createdAt)}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-6">
            <div>
              <p className="text-xl font-black">{myBlogs.length}</p>
              <p className="text-xs text-muted">Posts</p>
            </div>
            <div>
              <p className="text-xl font-black">{totalLikes}</p>
              <p className="text-xs text-muted">Likes</p>
            </div>
            <div>
              <p className="text-xl font-black capitalize">{user.role}</p>
              <p className="text-xs text-muted">Role</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          aria-label="Edit profile"
        >
          <h2 className="mb-4 text-lg font-bold">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
            <Input
              label="Name"
              placeholder="Your name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLogout}
                loading={loggingOut}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </form>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label="My blogs"
        >
          <h2 className="mb-4 text-lg font-bold">My Blogs</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : myBlogs.length === 0 ? (
            <EmptyState
              title="No blogs yet"
              description="Share your first story with the world."
              actionLabel="Create a Post"
              actionHref="/create-blog"
            />
          ) : (
            <div className="space-y-3">
              {myBlogs.slice(0, 6).map((blog) => (
                <button
                  key={blog._id}
                  onClick={() => router.push(`/blogs/${blog._id}`)}
                  className="glass card-hover flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {blog.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {blog.category} · {formatDate(blog.createdAt)} ·{" "}
                      {blog.likes.length} likes
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    View →
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-3xl border border-danger/30 bg-danger/5 p-6"
          aria-label="Danger zone"
        >
          <h2 className="mb-2 text-lg font-bold text-danger">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">
            Deleting your account permanently removes your profile, all your
            blogs, and all your comments.
          </p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </motion.section>

        <ConfirmDialog
          open={deleteOpen}
          title="Delete your account?"
          description="This permanently deletes your profile, all your blogs, and comments. This action cannot be undone."
          confirmLabel="Delete Account"
          loading={deleting}
          onConfirm={handleDeleteAccount}
          onClose={() => setDeleteOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
