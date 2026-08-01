"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground/90"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            suppressHydrationWarning
            className={cn(
              "h-11 w-full rounded-xl border border-line bg-card px-4 text-sm text-foreground placeholder:text-muted/70 transition-all duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 outline-none",
              icon && "pl-10",
              error && "border-danger/60 focus:border-danger focus:ring-danger/20",
              className
            )}
            aria-invalid={error ? true : undefined}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
