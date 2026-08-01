import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-24" aria-label="Get started">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-bg px-6 py-16 text-center shadow-glow sm:px-12">
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-black/10 blur-3xl"
            aria-hidden
          />
          <h2 className="relative mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your story deserves to be told
          </h2>
          <p className="relative mx-auto mb-8 max-w-xl text-base text-white/80 sm:text-lg">
            Join BlogSphere today and start publishing beautiful posts that
            people love to read. It takes less than a minute.
          </p>
          <div className="relative flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/register"
              size="lg"
              className="!bg-none !bg-white !text-primary shadow-lg hover:!shadow-xl"
            >
              Create Your Account
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            <Button
              href="/blogs"
              variant="secondary"
              size="lg"
              className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
            >
              Read the Blog
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
