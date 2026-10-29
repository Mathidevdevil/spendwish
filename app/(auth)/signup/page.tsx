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
  PlusCircle,
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

        const msg = error.message || "Failed to create account. Please try again.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      if (authData?.session) {
        toast.success("Account created successfully!");
        window.location.href = "/dashboard";
      } else if (authData?.user) {
        setCheckInboxEmail(data.email);
        toast.success("Confirmation email sent! Please check your inbox.");
      }
    } catch {
      const msg = "Failed to create account. Please try again.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={checkInboxEmail ? "Check your inbox" : "Create an account"}
      description={
        checkInboxEmail
          ? `We sent a confirmation link to ${checkInboxEmail}`
          : "Track expenses, create monthly budgets, and manage your travel"
      }
    >
      {checkInboxEmail ? (
        <div className="space-y-5 text-center py-2 animate-in fade-in-50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">
              Verify your email address
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-foreground">{checkInboxEmail}</strong>.
              Click the link in your email to confirm your account and access your
              dashboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Return to sign in</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setCheckInboxEmail(null)}
            >
              Sign up with a different email
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1-Click Access Options: Clean full-width stacked pair */}
          <div className="flex flex-col gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDemoLogin("demo@spendwise.app", "Aarav Sharma")}
              disabled={demoLoading || loading}
              className="w-full h-11 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
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
              className="w-full h-11 border-border bg-card hover:bg-accent text-foreground font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
            >
              {demoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-foreground" />
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Start Empty (Clean Workspace)</span>
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
                Or sign up with credentials
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
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Aarav Sharma"
                  className="pl-9"
                  autoComplete="name"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
              <Label htmlFor="password">Password (min 8 characters)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
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
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword.message}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthCard
          title="Create an account"
          description="Track expenses, create monthly budgets, and manage your travel"
        >
          <div className="h-48 animate-pulse bg-muted rounded-xl" />
        </AuthCard>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
