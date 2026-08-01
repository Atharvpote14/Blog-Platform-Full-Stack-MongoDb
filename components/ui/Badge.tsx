import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function Badge({ children, className, gradient = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        gradient
          ? "gradient-bg text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]"
          : "border border-line bg-card/80 text-foreground/90",
        className
      )}
    >
      {children}
    </span>
  );
}
