"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/format";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "oauth_failed") {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/login");
    } else if (error === "email_not_verified") {
      toast.error("Your Google email is not verified.");
      router.replace("/login");
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong relative w-full max-w-md rounded-3xl p-8 shadow-glow"
    >
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-black tracking-tight">
          Welcome <span className="gradient-text">back</span>
        </h1>
        <p className="text-sm text-muted">
          Log in to continue your writing journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          disabled={loading}
        >
          {isSubmitting ? "Logging in…" : "Login"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          or continue with
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary transition-colors hover:text-secondary"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
