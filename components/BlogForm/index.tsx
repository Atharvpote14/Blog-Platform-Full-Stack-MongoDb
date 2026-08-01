"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Globe, ImagePlus, Lock, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { resolveImageUrl } from "@/lib/images";
import { blogsApi } from "@/services/blogs";
import type { Blog, Visibility } from "@/types";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/format";

const MIN_TITLE_CHARS = 3;
const MAX_TITLE_CHARS = 200;
const MAX_CATEGORY_CHARS = 50;
const MIN_CONTENT_CHARS = 10;
const MAX_CONTENT_CHARS = 50000;
const MAX_CONTENT_WORDS = 10000;

const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const blogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_CHARS, `Title must be at least ${MIN_TITLE_CHARS} characters`)
    .max(MAX_TITLE_CHARS, `Title must not exceed ${MAX_TITLE_CHARS} characters`),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(
      MAX_CATEGORY_CHARS,
      `Category must not exceed ${MAX_CATEGORY_CHARS} characters`
    ),
  content: z
    .string()
    .trim()
    .min(
      MIN_CONTENT_CHARS,
      `Content must be at least ${MIN_CONTENT_CHARS} characters`
    )
    .max(
      MAX_CONTENT_CHARS,
      `Content must not exceed ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters`
    )
    .refine(
      (value) => countWords(value) <= MAX_CONTENT_WORDS,
      `Content must not exceed ${MAX_CONTENT_WORDS.toLocaleString("en-US")} words`
    ),
  visibility: z.enum(["public", "private"]),
});

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    value: "public",
    label: "Public",
    description: "Visible to everyone in the Blog section",
    icon: Globe,
  },
  {
    value: "private",
    label: "Private",
    description: "Only visible to you",
    icon: Lock,
  },
];

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
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues:
      mode === "edit" && blog
        ? {
            title: blog.title,
            category: blog.category,
            content: blog.content,
            visibility: blog.visibility === "public" ? "public" : "private",
          }
        : { title: "", category: "", content: "", visibility: "public" },
  });

  const visibility = watch("visibility");
  const titleValue = watch("title");
  const contentValue = watch("content");
  const hasStoredVisibility = mode === "edit" ? !!blog?.visibility : true;

  const titleChars = titleValue?.length ?? 0;
  const contentChars = contentValue?.length ?? 0;
  const contentWords = countWords(contentValue ?? "");

  useEffect(() => {
    if (mode === "edit" && blog) {
      reset({
        title: blog.title,
        category: blog.category,
        content: blog.content,
        visibility: blog.visibility === "public" ? "public" : "private",
      });
    }
  }, [mode, blog, reset]);

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
    formData.append("visibility", values.visibility);
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
        <div className="space-y-1.5">
          <Input
            label="Title"
            placeholder="An engaging title for your story…"
            maxLength={MAX_TITLE_CHARS}
            error={errors.title?.message}
            {...register("title")}
          />
          <p
            className={cn(
              "text-right text-xs",
              titleChars > MAX_TITLE_CHARS
                ? "font-medium text-danger"
                : titleChars >= MAX_TITLE_CHARS - 20
                  ? "text-warning"
                  : "text-muted/70"
            )}
          >
            {titleChars}/{MAX_TITLE_CHARS} characters
          </p>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-foreground/90"
          >
            Category
          </label>
          <input
            suppressHydrationWarning
            id="category"
            list="blog-categories"
            placeholder="e.g. Technology"
            maxLength={MAX_CATEGORY_CHARS}
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
          Visibility
        </span>
        {mode === "edit" && !hasStoredVisibility && (
          <p className="text-xs font-medium text-warning">
            This post has no saved visibility — kept as Private so it can&apos;t
            be accidentally published. Choose Public only if you intend to.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {VISIBILITY_OPTIONS.map((option) => {
            const selected = visibility === option.value;
            return (
              <button
                suppressHydrationWarning
                key={option.value}
                type="button"
                onClick={() => setValue("visibility", option.value, { shouldValidate: true })}
                aria-pressed={selected}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                  selected
                    ? "border-primary/60 bg-primary/10 shadow-[0_8px_24px_-12px_rgba(79,70,229,0.5)]"
                    : "border-line bg-card/50 hover:border-primary/30 hover:bg-card"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    selected ? "gradient-bg text-white" : "border border-line text-muted"
                  )}
                >
                  <option.icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      selected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground/90">
          Cover Image
        </span>
        <input
          suppressHydrationWarning
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
              suppressHydrationWarning
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
            suppressHydrationWarning
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

      <div className="space-y-1.5">
        <TextArea
          label="Content"
          placeholder="Write your story here…"
          rows={12}
          maxLength={MAX_CONTENT_CHARS}
          error={errors.content?.message}
          {...register("content")}
        />
        <p
          className={cn(
            "text-right text-xs",
            contentChars > MAX_CONTENT_CHARS || contentWords > MAX_CONTENT_WORDS
              ? "font-medium text-danger"
              : contentChars >= MAX_CONTENT_CHARS - 5000 ||
                  contentWords >= MAX_CONTENT_WORDS - 1000
                ? "text-warning"
                : "text-muted/70"
          )}
        >
          {contentWords.toLocaleString("en-US")} words ·{" "}
          {contentChars.toLocaleString("en-US")}/
          {MAX_CONTENT_CHARS.toLocaleString("en-US")} characters
        </p>
      </div>

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
