"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Plus, UserCheck } from "lucide-react";
import { enableDemoMode } from "@/lib/demo-data";
import { sanitizeRedirectPath } from "@/lib/utils";

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function GoogleOAuthButtonInner({ text }: { text: string }) {
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomAccount, setIsCustomAccount] = useState(false);

  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || searchParams.get("redirect");
  const targetRedirect = sanitizeRedirectPath(rawNext, "/dashboard");
  const supabase = createClient();

  const handleSelectDemoAccount = async (name: string, email: string) => {
    try {
      setLoading(true);
      enableDemoMode(email, name);
      await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      toast.success(`Signed in as ${name} (${email})`);
      window.location.href = targetRedirect;
    } catch {
      toast.error("Failed to select account");
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      toast.error("Please enter a valid Google email address");
      return;
    }
    const name = customName.trim() || customEmail.split("@")[0];
    handleSelectDemoAccount(name, customEmail.trim());
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const isPlaceholderUrl =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("spendwise-demo.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      // When running in local environment without connected Supabase backend,
      // present the Google account selection interface
      if (isPlaceholderUrl) {
        setLoading(false);
        setShowPicker(true);
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        targetRedirect
      )}`;

      // Official Google OAuth with account chooser forced (select_account)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account consent",
          },
        },
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("not enabled") ||
          error.message?.toLowerCase().includes("unsupported provider")
        ) {
          toast.error(
            "Google provider is not enabled in your Supabase project under Authentication > Providers > Google."
          );
        } else {
          toast.error(error.message || "Failed to sign in with Google");
        }
        setLoading(false);
      }
    } catch {
      toast.error("Could not initiate Google sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={text}
        className="w-full flex items-center justify-center gap-3 h-11 text-sm font-medium border-border hover:bg-accent/80 transition-all rounded-xl cursor-pointer"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon className="h-4 w-4 shrink-0" />
        )}
        <span>{text}</span>
      </Button>

      {/* Google Account Selection Modal (Active when using demo/local setup) */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent
          className="max-w-md p-6 rounded-[24px] border border-border/80 bg-surface shadow-2xl backdrop-blur-xl"
          data-lenis-prevent="true"
        >
          <DialogHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-2xl bg-surface-elevated border border-border/60 flex items-center justify-center shadow-sm">
                <GoogleIcon className="h-6 w-6" />
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Choose an account
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              to continue to <span className="font-semibold text-foreground">Spendwise</span>
            </p>
          </DialogHeader>

          {!isCustomAccount ? (
            <div className="space-y-2 pt-2">
              {/* Account Option 1 */}
              <button
                type="button"
                onClick={() =>
                  handleSelectDemoAccount("Aarav Sharma", "aarav.sharma@gmail.com")
                }
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-border/60 bg-surface-elevated hover:bg-primary/10 hover:border-primary/40 transition-all text-left group cursor-pointer"
              >
                <Avatar className="h-10 w-10 border border-border/60 bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
                    AS
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    Aarav Sharma
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    aarav.sharma@gmail.com
                  </p>
                </div>
                <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-60 group-hover:opacity-100 shrink-0" />
              </button>

              {/* Account Option 2 */}
              <button
                type="button"
                onClick={() =>
                  handleSelectDemoAccount("Alex Mercer", "alex.mercer@gmail.com")
                }
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-border/60 bg-surface-elevated hover:bg-primary/10 hover:border-primary/40 transition-all text-left group cursor-pointer"
              >
                <Avatar className="h-10 w-10 border border-border/60 bg-cyan-500/10 text-cyan-500 font-bold shrink-0">
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 font-semibold text-sm">
                    AM
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    Alex Mercer
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    alex.mercer@gmail.com
                  </p>
                </div>
                <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-60 group-hover:opacity-100 shrink-0" />
              </button>

              {/* Option 3: Use Another Account */}
              <button
                type="button"
                onClick={() => setIsCustomAccount(true)}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-dashed border-border/80 hover:border-primary/50 bg-transparent hover:bg-surface-elevated transition-all text-left text-muted-foreground hover:text-foreground text-sm font-medium cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Use another Google account</span>
              </button>

              <div className="pt-3 border-t border-border/60 text-center">
                <p className="text-[11px] text-muted-foreground">
                  To connect official <span className="font-mono">accounts.google.com</span> OAuth, add your real Supabase keys to <code className="font-mono text-foreground">.env.local</code>.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Priya Patel"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-10 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Google Email Address <span className="text-primary">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="you@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCustomAccount(false)}
                  className="flex-1 text-xs h-10 cursor-pointer"
                >
                  Back to List
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-gradient text-xs h-10 font-semibold cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In with Google"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GoogleOAuthButton({
  text = "Continue with Google",
}: {
  text?: string;
}) {
  return (
    <Suspense
      fallback={
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full flex items-center justify-center gap-3 h-11 text-sm font-medium border-border rounded-xl"
        >
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span>{text}</span>
        </Button>
      }
    >
      <GoogleOAuthButtonInner text={text} />
    </Suspense>
  );
}
