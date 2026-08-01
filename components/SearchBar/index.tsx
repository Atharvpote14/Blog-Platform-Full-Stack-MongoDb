"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [input, setInput] = useState(value);
  const debounced = useDebounce(input, 400);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange(debounced);
  }, [debounced, onChange]);

  useEffect(() => {
    setInput(value);
  }, [value]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder ?? "Search blogs by title, content or category…"}
        aria-label="Search blogs"
        className="h-12 w-full rounded-2xl border border-line bg-card pl-11 pr-11 text-sm text-foreground placeholder:text-muted/70 transition-all duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 outline-none"
      />
      {input && (
        <button
          onClick={() => setInput("")}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
