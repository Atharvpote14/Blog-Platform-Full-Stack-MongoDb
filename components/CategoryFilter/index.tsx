"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  active,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="tablist"
      aria-label="Filter by category"
    >
      <FilterChip
        label="All"
        active={active === ""}
        onClick={() => onSelect("")}
        gradient
      />
      {categories.map((category) => (
        <FilterChip
          key={category}
          label={category}
          active={active === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  gradient = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  gradient?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "text-white"
          : "border border-line bg-card text-muted hover:text-foreground",
        gradient && active && "gradient-bg shadow-glow"
      )}
    >
      {active && !gradient && (
        <motion.span
          layoutId="category-active"
          className="absolute inset-0 rounded-full gradient-bg"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}
