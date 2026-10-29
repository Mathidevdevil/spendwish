"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { enableDemoMode } from "@/lib/demo-data";
import { sanitizeRedirectPath } from "@/lib/utils";

export function GoogleOAuthButton({
  text = "Continue with Google",
}: {
  text?: string;
}) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || searchParams.get("redirect");
  const targetRedirect = sanitizeRedirectPath(rawNext, "/dashboard");
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isPlaceholderUrl) {
        // Fallback for demo/offline environment without active OAuth provider
        enableDemoMode("google.user@spendwise.app", "Google User");
        await fetch("/api/auth/demo-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "google.user@spendwise.app",
            name: "Google User",
          }),
        });
        toast.success("Signed in with Google (Demo Mode)");
        window.location.href = targetRedirect;
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        targetRedirect
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to sign in with Google");
        setLoading(false);
      }
    } catch {
      toast.error("Could not initiate Google sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={text}
      className="w-full flex items-center justify-center gap-3 h-11 text-sm font-medium border-border hover:bg-accent/80 transition-all rounded-xl"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{text}</span>
    </Button>
  );
}
