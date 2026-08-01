"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { blogsApi } from "@/services/blogs";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage, formatCount } from "@/utils/format";
import { cn } from "@/utils/cn";

interface LikeButtonProps {
  blogId: string;
  initialLikes: string[];
}

export function LikeButton({
  blogId,
  initialLikes = [],
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(
    user ? initialLikes.includes(user._id) : false
  );
  const [count, setCount] = useState(initialLikes.length);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like this post");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const result = await blogsApi.toggleLike(blogId);
      setLiked(result.isLiked);
      setCount(result.likes);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleLike}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60",
        liked
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-line bg-card text-muted hover:border-danger/40 hover:text-danger"
      )}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      aria-pressed={liked}
    >
      <Heart
        className={cn("h-4.5 w-4.5 transition-all", liked && "fill-danger")}
      />
      {formatCount(count)}
    </motion.button>
  );
}
