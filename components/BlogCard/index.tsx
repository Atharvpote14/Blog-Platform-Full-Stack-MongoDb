"use client";

import { motion } from "framer-motion";
import { CalendarDays, Heart, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/Badge";
import { resolveImageUrl } from "@/lib/images";
import type { Blog } from "@/types";
import { formatCount, formatDate, readingTime } from "@/utils/format";

export function BlogCard({ blog, index = 0 }: { blog: Blog; index?: number }) {
  const authorName =
    typeof blog.author === "string" || !blog.author
      ? "Unknown"
      : blog.author.name;
  const authorAvatar =
    typeof blog.author === "string" || !blog.author
      ? undefined
      : blog.author.avatar;
  const coverImage = resolveImageUrl(blog.coverImage);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.4) }}
      className="group glass card-hover flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <Link
        href={`/blogs/${blog._id}`}
        className="relative block aspect-video overflow-hidden"
        aria-label={`Read ${blog.title}`}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gradient-bg opacity-80 transition-transform duration-500 group-hover:scale-105">
            <span className="text-4xl font-black text-white/40">
              {blog.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge gradient>{blog.category}</Badge>
          {blog.visibility === "private" && (
            <Badge className="border-white/30 bg-black/50 text-white backdrop-blur">
              <Lock className="h-3 w-3" />
              Private
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/blogs/${blog._id}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </Link>
        <p className="line-clamp-3 mt-2.5 flex-1 text-sm leading-relaxed text-muted">
          {blog.content}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <div className="flex items-center gap-2.5">
            <UserAvatar name={authorName} avatar={authorAvatar} size="sm" />
            <div>
              <p className="text-xs font-semibold">{authorName}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays className="h-3 w-3" />
                {formatDate(blog.createdAt)} · {readingTime(blog.content)}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-muted">
            <Heart className="h-3.5 w-3.5 text-danger" />
            {formatCount(blog.likes?.length ?? 0)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
