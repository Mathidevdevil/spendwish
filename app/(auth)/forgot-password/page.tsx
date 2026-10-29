"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isPlaceholderUrl) {
        // Mock success in local placeholder mode
        setSubmitted(true);
        toast.success("Password reset instructions sent");
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      });

      if (error) {
        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many requests")
        ) {
          const msg = "Too many reset attempts. Please wait a moment and try again.";
          setErrorMessage(msg);
          toast.error(msg);
          return;
        }

        // To protect privacy, do not disclose whether email exists
        setSubmitted(true);
        toast.success("Password reset instructions sent");
        return;
      }

      setSubmitted(true);
      toast.success("Password reset instructions sent");
    } catch {
      setSubmitted(true);
      toast.success("Password reset instructions sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your registered email and we'll send you a password reset link"
    >
      {submitted ? (
        <div className="space-y-4 text-center py-2 animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Check your email</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account exists for that email, we have sent instructions to
              reset your password. Click the link in the email to set a new password.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full mt-4">
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium"
            >
              {errorMessage}
            </div>
          )}

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

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
