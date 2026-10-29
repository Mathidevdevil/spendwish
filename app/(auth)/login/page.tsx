"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, PlusCircle, Sparkles } from "lucide-react";
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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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

      // If backend is placeholder or demo without real Supabase connection,
      // fail with invalid credentials unless using the instant demo access buttons
      if (isPlaceholderUrl) {
        // Allow instant demo logins through dedicated buttons, but validate credentials
        const friendlyMsg = "Invalid email or password";
        setAuthError(friendlyMsg);
        toast.error(friendlyMsg);
        return;
      }

      // Call Supabase auth with 6s timeout
      const signInPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              data: null,
              error: { message: "timeout", status: 408 },
            }),
          6000
        )
      );

      const { data: authData, error } = (await Promise.race([
        signInPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many requests")
        ) {
          const msg = "Too many login attempts. Please try again later.";
          setAuthError(msg);
          toast.error(msg);
          return;
        }

        // Generic error mapping without leaking whether user exists
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
      {/* 1-Click Access Options: Demo with sample data OR Clean empty workspace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDemoLogin("demo@spendwise.app", "Aarav Sharma")}
          disabled={demoLoading || loading}
          className="h-11 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs"
        >
          {demoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Instant Demo Access (Sample Data)</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleDemoLogin("newuser@spendwise.app", "New User")}
          disabled={demoLoading || loading}
          className="h-11 border-border bg-card hover:bg-accent text-foreground font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs"
        >
          {demoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>New User Access (Clean & Empty)</span>
            </>
          )}
        </Button>
      </div>

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

      <GoogleOAuthButton text="Continue with Google" />

      {authError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in-50"
        >
          {authError}
        </div>
      )}

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
