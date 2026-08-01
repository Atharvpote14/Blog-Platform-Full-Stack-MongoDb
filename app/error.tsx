"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10">
        <TriangleAlert className="h-10 w-10 text-danger" />
      </div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-danger">
        Something went wrong
      </p>
      <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
        Oops, an error occurred
      </h1>
      <p className="mb-8 max-w-md text-muted">
        We hit an unexpected issue while loading this page. Please try again —
        if the problem persists, check that the backend server is running.
      </p>
      <Button onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
