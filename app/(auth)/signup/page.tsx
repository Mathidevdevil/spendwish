"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/schemas/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleOAuthButton } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enableDemoMode } from "@/lib/demo-data";

function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkInboxEmail, setCheckInboxEmail] = useState<string | null>(null);
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
      window.location.href = "/dashboard";
    } catch {
      toast.error("Failed to start demo session");
      setDemoLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      setLoading(true);
      setAuthError(null);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isPlaceholderUrl) {
        toast.info("Supabase backend placeholder active. Initializing account...");
        await handleDemoLogin(data.email, data.fullName);
        return;
      }

      const signUpPromise = supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(
          () => resolve({ data: null, error: { message: "timeout", status: 408 } }),
          6000
        )
      );

      const { data: authData, error } = (await Promise.race([
        signUpPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        if (
          error.status === 422 ||
          error.message?.toLowerCase().includes("already registered") ||
          error.message?.toLowerCase().includes("user already exists")
        ) {
          const msg = "An account with this email already exists. Please sign in instead.";
          setAuthError(msg);
          toast.error(msg);
          return;
        }

        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many requests")
        ) {
          const msg = "Too many sign-up attempts. Please try again later.";
          setAuthError(msg);
          toast.error(msg);
          return;
        }

        const msg = error.message || "Unable to register. Please verify your details.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      if (authData?.user && !authData.session) {
        setCheckInboxEmail(data.email);
        return;
      }

      if (authData?.session) {
        toast.success("Account created successfully! Welcome to Spendwise.");
        window.location.href = "/dashboard";
      }
    } catch {
      const msg = "Registration failed. Please check network connection.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {checkInboxEmail ? (
        <div className="text-center py-6 space-y-4">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Check your inbox</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We sent a verification link to <strong className="text-foreground">{checkInboxEmail}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" className="rounded-xl text-xs h-10">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        </div>
      ) : (
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
                Or sign up with credentials
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

          {/* 3. Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Aarav Sharma"
                  className="pl-10 h-12 text-base rounded-xl bg-surface border-border/80 focus:border-emerald-400"
                  autoComplete="name"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
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
                <p className="text-xs text-rose-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 text-base rounded-xl bg-surface border-border/80 focus:border-emerald-400"
                  autoComplete="new-password"
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

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 text-base rounded-xl bg-surface border-border/80 focus:border-emerald-400"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.confirmPassword.message}
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
                  Creating account...
                </>
              ) : (
                "Create account"
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

          {/* 5. Switch to Login */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start tracking your cash flow and travel budgets today"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-xl" />}>
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}
