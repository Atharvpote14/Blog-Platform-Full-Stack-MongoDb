"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg shadow-glow">
        <Inbox className="h-8 w-8 text-white" />
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-muted">{description}</p>
      )}
      {actionLabel && (
        <Button
          variant="secondary"
          onClick={onAction}
          href={actionHref}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
