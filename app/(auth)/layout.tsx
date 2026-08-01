import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your BlogSphere account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 animate-float rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 animate-float-slow rounded-full bg-secondary/15 blur-3xl"
        aria-hidden
      />
      {children}
    </div>
  );
}
