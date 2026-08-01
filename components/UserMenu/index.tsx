"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FilePenLine, LayoutDashboard, Lock, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getErrorMessage } from "@/utils/format";
import { cn } from "@/utils/cn";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Post", href: "/create-blog", icon: FilePenLine },
  { label: "My Blogs", href: "/blogs?view=mine", icon: Lock },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  if (!user) return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        suppressHydrationWarning
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-card"
        aria-label="Open user menu"
        aria-expanded={open}
      >
        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted transition-transform duration-200 sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl p-2 shadow-glow"
            role="menu"
          >
            <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
              <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mb-1 h-px bg-line" />
            {menuItems.map((item) => (
              <button
                suppressHydrationWarning
                key={item.href}
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
                role="menuitem"
              >
                <item.icon className="h-4 w-4 text-muted" />
                {item.label}
              </button>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              suppressHydrationWarning
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
