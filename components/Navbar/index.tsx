"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Feather, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Dashboard", href: "/dashboard", protected: true },
  { label: "Profile", href: "/profile", protected: true },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const visibleLinks = navLinks.filter((link) => !link.protected || user);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="BlogSphere home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-glow">
            <Feather className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Blog<span className="gradient-text">Sphere</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-card border border-line"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                href="/create-blog"
                size="sm"
                className="hidden md:inline-flex"
              >
                New Post
              </Button>
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button href="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button href="/register" size="sm">
                Get Started
              </Button>
            </div>
          )}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-foreground md:hidden"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-line bg-background p-5"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                    <Feather className="h-4 w-4 text-white" />
                  </span>
                  <span className="font-bold">
                    Blog<span className="gradient-text">Sphere</span>
                  </span>
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                  <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {visibleLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        pathname.startsWith(link.href)
                          ? "bg-card text-foreground border border-line"
                          : "text-muted hover:bg-card hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * visibleLinks.length }}
                  >
                    <Link
                      href="/create-blog"
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-foreground"
                    >
                      Create Post
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="mt-auto space-y-3">
                {!user && (
                  <div className="space-y-2">
                    <Button href="/login" variant="secondary" fullWidth>
                      Login
                    </Button>
                    <Button href="/register" fullWidth>
                      Get Started
                    </Button>
                  </div>
                )}
                <p className="text-center text-xs text-muted">
                  © {new Date().getFullYear()} BlogSphere
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
