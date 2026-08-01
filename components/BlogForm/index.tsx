"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { resolveImageUrl } from "@/lib/images";
import { blogsApi } from "@/services/blogs";
import type { Blog } from "@/types";
import { getErrorMessage } from "@/utils/format";

const blogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  category: z.string().trim().min(1, "Category is required"),
  content: z
    .string()
    .trim()
    .min(10, "Content must be at least 10 characters"),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  mode: "create" | "edit";
  blog?: Blog;
  categories?: string[];
}

const PRESET_CATEGORIES = [
  "Technology",
  "Programming",
  "Lifestyle",
  "Travel",
  "Food",
  "Business",
  "Health",
  "Science",
  "Design",
  "Education",
];

export function BlogForm({ mode, blog, categories = [] }: BlogFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    mode === "edit" && blog ? resolveImageUrl(blog.coverImage) : ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allCategories = Array.from(
    new Set([...PRESET_CATEGORIES, ...categories])
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues:
      mode === "edit" && blog
        ? {
            title: blog.title,
            category: blog.category,
            content: blog.content,
          }
        : { title: "", category: "", content: "" },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const onSubmit = async (values: BlogFormValues) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("category", values.category);
    formData.append("content", values.content);
    if (file) formData.append("coverImage", file);

    try {
      const blogResult =
        mode === "create"
          ? await blogsApi.createBlog(formData)
          : await blogsApi.updateBlog(blog!._id, formData);

      toast.success(
        mode === "create" ? "Blog published successfully" : "Blog updated successfully"
      );
      router.push(`/blogs/${blogResult._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="glass space-y-6 rounded-3xl p-6 sm:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Title"
          placeholder="An engaging title for your story…"
          error={errors.title?.message}
          {...register("title")}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-foreground/90"
          >
            Category
          </label>
          <input
            id="category"
            list="blog-categories"
            placeholder="e.g. Technology"
            className="h-11 w-full rounded-xl border border-line bg-card px-4 text-sm text-foreground placeholder:text-muted/70 transition-all duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 outline-none"
            aria-invalid={errors.category ? true : undefined}
            {...register("category")}
          />
          <datalist id="blog-categories">
            {allCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {errors.category && (
            <p className="text-xs font-medium text-danger" role="alert">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground/90">
          Cover Image
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          aria-label="Upload cover image"
        />
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-line">
            <Image
              src={preview}
              alt="Cover image preview"
              width={1200}
              height={675}
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur transition-colors hover:bg-danger"
              aria-label="Remove cover image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-card/50 transition-all hover:border-primary/50 hover:bg-card"
            aria-label="Upload cover image"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-bg shadow-glow">
              <ImagePlus className="h-6 w-6 text-white" />
            </span>
            <span className="text-sm font-medium text-muted">
              Click to upload a cover image
            </span>
            <span className="text-xs text-muted/70">
              PNG, JPG, GIF, WEBP · max 5MB
            </span>
          </button>
        )}
      </div>

      <TextArea
        label="Content"
        placeholder="Write your story here…"
        rows={12}
        error={errors.content?.message}
        {...register("content")}
      />

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? (
            "Publishing…"
          ) : mode === "create" ? (
            "Publish Post"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </motion.form>
  );
}
