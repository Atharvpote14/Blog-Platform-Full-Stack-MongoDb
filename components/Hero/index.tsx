"use client";

import { motion } from "framer-motion";
import { ArrowRight, Feather, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Hero() {
  const { user } = useAuth();
  const [cursor, setCursor] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${cursor.x}px ${cursor.y}px, rgba(79,70,229,0.08), transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 animate-float rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-96 w-96 animate-float-slow rounded-full bg-secondary/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <motion.div variants={item} className="mb-6 flex justify-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            The modern home for your ideas
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mb-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Write stories that
          <br />
          <span className="gradient-text">captivate the world.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          BlogSphere is a premium blogging platform designed for writers who
          care about their craft. Publish beautiful posts, grow your audience,
          and let your voice be heard.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button href={user ? "/dashboard" : "/register"} size="lg">
            {user ? "Go to Dashboard" : "Start Writing Free"}
            <ArrowRight className="h-4.5 w-4.5" />
          </Button>
          <Button href="/blogs" variant="secondary" size="lg">
            <Feather className="h-4.5 w-4.5" />
            Explore Blogs
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10"
        >
          <Stat icon={<Star className="h-4 w-4" />} label="Beautifully designed" />
          <Stat icon={<Feather className="h-4 w-4" />} label="Zero clutter" />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="Built for readers" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg/20 border border-primary/30 text-primary">
        {icon}
      </span>
      {label}
    </div>
  );
}
