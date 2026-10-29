"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, Sparkles, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { CommandPalette } from "./command-palette";
import { Button } from "@/components/ui/button";
import { transactionModal } from "@/hooks/use-transaction-modal";

interface TopNavProps {
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string | null;
}

export function TopNav({ userEmail, userName, avatarUrl }: TopNavProps) {
  const pathname = usePathname();
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(userEmail || null);
  const [resolvedName, setResolvedName] = useState<string | null>(userName || null);
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(avatarUrl || null);
  const [isDemo, setIsDemo] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Compute active page title
  let pageTitle = "Dashboard";
  if (pathname.startsWith("/transactions")) pageTitle = "Transactions";
  else if (pathname.startsWith("/budgets")) pageTitle = "Budgets";
  else if (pathname.startsWith("/trips")) pageTitle = "Travel Plans";
  else if (pathname.startsWith("/settings")) pageTitle = "Settings";

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
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile brand header (<1024px) */}
          <div className="flex lg:hidden items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-emerald-500/20 shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
            <Link href="/" className="font-bold text-base tracking-tight text-foreground truncate">
              Spendwise
            </Link>
          </div>

          {/* Desktop Left: Current Page Title (Short, confident, no filler) */}
          <div className="hidden lg:flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {pageTitle}
            </h1>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-surface hover:bg-surface-elevated text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
              title="Search or commands (Ctrl+K / Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-surface-elevated border border-border/60 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Desktop Quick-Add Button (Gradient Accent) */}
            <Button
              onClick={() => transactionModal.open()}
              className="hidden lg:inline-flex btn-gradient h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>New Entry</span>
            </Button>

            <ThemeToggle />

            <UserMenu
              email={resolvedEmail}
              name={resolvedName}
              avatarUrl={resolvedAvatar}
            />
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
