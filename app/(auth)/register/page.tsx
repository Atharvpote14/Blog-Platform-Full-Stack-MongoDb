"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/format";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register(values);
      toast.success("Account created — welcome to BlogSphere!");
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
          Create your <span className="gradient-text">account</span>
        </h1>
        <p className="text-sm text-muted">
          Join BlogSphere and start publishing today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Name"
          placeholder="Jane Doe"
          icon={<UserRound className="h-4 w-4" />}
          autoComplete="name"
          error={errors.name?.message}
          {...registerField("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...registerField("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField("password")}
        />
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          disabled={loading}
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          or sign up with
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleSignInButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:text-secondary"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
