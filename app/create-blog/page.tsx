"use client";

import { FilePenLine } from "lucide-react";
import { motion } from "framer-motion";
import { BlogForm } from "@/components/BlogForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CreateBlogPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-glow">
            <FilePenLine className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">
            Create a <span className="gradient-text">new post</span>
          </h1>
          <p className="text-muted">
            Write something worth reading. Your story starts here.
          </p>
        </motion.div>
        <BlogForm mode="create" />
      </div>
    </ProtectedRoute>
  );
}
