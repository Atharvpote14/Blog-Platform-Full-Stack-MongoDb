import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-bg shadow-glow">
        <Compass className="h-10 w-10 text-white" />
      </div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
        404 Error
      </p>
      <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s
        get you back on track.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/">Back to Home</Button>
        <Button href="/blogs" variant="secondary">
          Explore Blogs
        </Button>
      </div>
    </div>
  );
}
