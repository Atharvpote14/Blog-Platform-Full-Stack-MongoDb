import { AtSign, Feather, Globe, Rss } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create Post", href: "/create-blog" },
];

const resourceLinks = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Profile", href: "/profile" },
];

const socials = [
  { label: "Website", href: "https://example.com", icon: Globe },
  { label: "RSS", href: "/blogs", icon: Rss },
  { label: "Contact", href: "mailto:hello@blogsphere.dev", icon: AtSign },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-glow">
                <Feather className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Blog<span className="gradient-text">Sphere</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A modern blogging platform for writers who want their ideas to
              shine. Write, share, and inspire — beautifully.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Quick links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Account
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} BlogSphere. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Built with Next.js, Tailwind CSS & Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
