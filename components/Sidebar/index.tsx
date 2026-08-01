"use client";

import { motion } from "framer-motion";
import {
  FilePenLine,
  Home,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Post", href: "/create-blog", icon: FilePenLine },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Browse Blogs", href: "/blogs", icon: Home },
];

export function Sidebar({ active }: { active: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="hidden w-64 shrink-0 lg:block"
      aria-label="Dashboard sidebar"
    >
      <div className="glass sticky top-20 rounded-3xl p-4">
        <nav className="space-y-1" aria-label="Dashboard navigation">
          {items.map((item) => {
            const isActive = active === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted hover:bg-card hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl gradient-bg shadow-glow"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="my-4 h-px bg-line" />

        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-xs font-medium text-muted">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {user?.name ?? "Guest"}
          </p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}
