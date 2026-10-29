"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface TopNavProps {
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string | null;
}

export function TopNav({ userEmail, userName, avatarUrl }: TopNavProps) {
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(userEmail || null);
  const [resolvedName, setResolvedName] = useState<string | null>(userName || null);
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(avatarUrl || null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (userEmail) setResolvedEmail(userEmail);
    if (userName) setResolvedName(userName);
    if (avatarUrl) setResolvedAvatar(avatarUrl);

    const emailCookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spendwise_user_email="))
      ?.split("=")[1];
    const nameCookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spendwise_user_name="))
      ?.split("=")[1];
    const demoCookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spendwise_demo_session="))
      ?.split("=")[1];

    if (demoCookie === "true" || userEmail?.includes("@spendwise.app")) {
      setIsDemo(true);
    }

    if (!userEmail && emailCookie) {
      setResolvedEmail(decodeURIComponent(emailCookie));
    }
    if (!userName && nameCookie) {
      setResolvedName(decodeURIComponent(nameCookie));
    }

    // Also fetch from supabase auth client
    try {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (user) {
            if (!userEmail && user.email) setResolvedEmail(user.email);
            const metaName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0];
            if (!userName && metaName) setResolvedName(metaName);
            const metaAvatar =
              user.user_metadata?.avatar_url || user.user_metadata?.picture;
            if (!avatarUrl && metaAvatar) setResolvedAvatar(metaAvatar);

            if (user.email?.includes("@spendwise.app")) {
              setIsDemo(true);
            }
          }
        })
        .catch(() => {});
    } catch {}
  }, [userEmail, userName, avatarUrl]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile & Tablet brand header */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Wallet className="h-4 w-4" />
          </div>
          <Link href="/" className="font-bold text-base tracking-tight">
            Spendwise
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground/80">
            Personal Wealth & Budgeting
          </span>

          {isDemo && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Demo Mode</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isDemo && (
            <div className="lg:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Demo</span>
            </div>
          )}
          <ThemeToggle />
          <UserMenu
            email={resolvedEmail}
            name={resolvedName}
            avatarUrl={resolvedAvatar}
          />
        </div>
      </div>
    </header>
  );
}
