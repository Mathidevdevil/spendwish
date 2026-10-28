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

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      enableDemoMode();
      await fetch("/api/auth/demo-session", { method: "POST" });
      toast.success("Welcome to Spendwise! Logged in with Demo Account.");
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("Failed to start demo session");
    } finally {
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

      const isPlaceholderUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("spendwise-demo.supabase.co");
      const isDemoAccount = data.email.toLowerCase() === "demo@spendwise.app";

      // If Supabase credentials are placeholder or demo email is used, enter demo mode
      if (isPlaceholderUrl || isDemoAccount) {
        await handleDemoLogin();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Fallback to demo mode if network error connecting to unconfigured backend
        if (error.message.includes("fetch") || error.message.includes("network") || error.status === 0) {
          toast.info("Supabase backend not reachable. Entering Demo Mode...");
          await handleDemoLogin();
          return;
        }
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      // In case of unhandled fetch failure, fallback gracefully to demo mode
      toast.info("Supabase backend not reachable. Entering Demo Mode...");
      await handleDemoLogin();
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
        onClick={handleDemoLogin}
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
