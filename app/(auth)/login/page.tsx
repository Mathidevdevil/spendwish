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
import { sanitizeRedirectPath } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || searchParams.get("redirect");
  const targetRedirect = sanitizeRedirectPath(rawNext, "/dashboard");
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    urlError === "auth"
      ? "Authentication failed. Please try signing in again."
      : null
  );
  const supabase = createClient();

  const handleDemoLogin = async (customEmail?: string, customName?: string) => {
    try {
      setDemoLoading(true);
      const email =
        typeof customEmail === "string" && customEmail.includes("@")
          ? customEmail
          : "demo@spendwise.app";
      const name =
        typeof customName === "string" && customName.length > 0
          ? customName
          : "Aarav Sharma";

      enableDemoMode(email, name);
      await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      toast.success("Welcome to Spendwise! Logged in successfully.");
      window.location.href = targetRedirect;
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
      setAuthError(null);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      // Known demo shortcuts
      if (
        data.email.toLowerCase() === "demo@spendwise.app" &&
        data.password === "demo1234"
      ) {
        await handleDemoLogin("demo@spendwise.app", "Aarav Sharma");
        return;
      }

      if (
        data.email.toLowerCase() === "newuser@spendwise.app" &&
        data.password === "demo1234"
      ) {
        await handleDemoLogin("newuser@spendwise.app", "New User");
        return;
      }

      if (isPlaceholderUrl) {
        const friendlyMsg = "Invalid email or password";
        setAuthError(friendlyMsg);
        toast.error(friendlyMsg);
        return;
      }

      const signInPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              data: null,
              error: {
                message: "Connection timeout. Please check your credentials.",
              },
            }),
          6000
        )
      );

      const { data: authData, error: authErr } = (await Promise.race([
        signInPromise,
        timeoutPromise,
      ])) as any;

      if (authErr) {
        const errorMsg = (authErr.message || "").toLowerCase();
        if (errorMsg.includes("invalid login credentials")) {
          const msg = "Invalid email or password";
          setAuthError(msg);
          toast.error(msg);
          return;
        }

        if (errorMsg.includes("rate limit") || authErr.status === 429) {
          const msg = "Too many login attempts. Please try again later.";
          setAuthError(msg);
          toast.error(msg);
          return;
        }

        const msg = "Invalid email or password";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      if (authData?.user) {
        toast.success("Welcome back!");
        window.location.href = targetRedirect;
      }
    } catch {
      const msg = "Invalid email or password";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Google OAuth Button */}
      <GoogleOAuthButton text="Continue with Google" />

      {/* 2. Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/80" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground font-semibold">
            Or continue with email
          </span>
        </div>
      </div>

      {authError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium animate-in fade-in-50"
        >
          {authError}
        </div>
      )}

      {/* 3. Clean Credentials Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="pl-10 h-12 text-base rounded-xl bg-surface border-border/80 focus:border-emerald-400"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10 h-12 text-base rounded-xl bg-surface border-border/80 focus:border-emerald-400"
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg transition-colors"
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
            <p className="text-xs text-rose-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Primary Gradient Button */}
        <Button
          type="submit"
          className="w-full h-12 text-sm font-semibold rounded-xl btn-gradient mt-2"
          disabled={loading || demoLoading}
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

      {/* 4. Subtle Demo Options Row */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Try the demo:</span>
        <button
          type="button"
          onClick={() => handleDemoLogin("demo@spendwise.app", "Aarav Sharma")}
          disabled={demoLoading || loading}
          className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-border/80 text-foreground hover:border-emerald-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Sample data</span>
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => handleDemoLogin("newuser@spendwise.app", "New User")}
          disabled={demoLoading || loading}
          className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-border/80 text-foreground hover:border-cyan-400 hover:text-cyan-400 transition-colors"
        >
          Start empty
        </button>
      </div>

      {/* 5. Switch to Signup */}
      <div className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald-400 font-semibold hover:underline"
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
