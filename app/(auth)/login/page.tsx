"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleOAuthButton } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enableDemoMode } from "@/lib/demo-data";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const supabase = createClient();

  const handleDemoLogin = async (customEmail?: string, customName?: string) => {
    try {
      setDemoLoading(true);
      const email = typeof customEmail === "string" && customEmail.includes("@")
        ? customEmail
        : "demo@spendwise.app";
      const name = typeof customName === "string" && customName.length > 0
        ? customName
        : "Aarav Sharma";

      enableDemoMode(email, name);
      await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      toast.success("Welcome to Spendwise! Logged in successfully.");
      window.location.href = redirect;
    } catch {
      toast.error("Failed to start session");
      setDemoLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
      const isDemoAccount = data.email.toLowerCase() === "demo@spendwise.app";

      // If Supabase credentials are placeholder or demo email is used, enter demo mode
      if (isPlaceholderUrl || isDemoAccount) {
        await handleDemoLogin(data.email, data.email.split("@")[0]);
        return;
      }

      // Safe sign-in with 3.5s timeout to prevent UI freeze
      const signInPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      const timeoutPromise = new Promise<{ error: any }>((resolve) =>
        setTimeout(
          () => resolve({ error: { message: "Network timeout connecting to backend", status: 0 } }),
          3500
        )
      );

      const { error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        // Fallback to demo session if network error or unconfigured backend
        if (
          error.message?.includes("fetch") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout") ||
          error.status === 0
        ) {
          toast.info("Entering Demo Mode session for " + data.email);
          await handleDemoLogin(data.email, data.email.split("@")[0]);
          return;
        }
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      window.location.href = redirect;
    } catch {
      toast.info("Entering Demo Mode session...");
      await handleDemoLogin(data.email, data.email.split("@")[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1-Click Instant Demo Login */}
      <Button
        type="button"
        variant="outline"
        onClick={() => handleDemoLogin()}
        disabled={demoLoading || loading}
        className="w-full h-11 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        {demoLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading demo workspace...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Instant Demo Access (No Account Required)</span>
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">
            Or sign in with credentials
          </span>
        </div>
      </div>

      <GoogleOAuthButton text="Sign in with Google" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-9"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-9"
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary font-semibold hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your Spendwise finances"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
