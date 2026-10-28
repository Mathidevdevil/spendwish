"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface TopNavProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function TopNav({ userEmail, userName }: TopNavProps) {
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(userEmail || null);
  const [resolvedName, setResolvedName] = useState<string | null>(userName || null);

  useEffect(() => {
    if (userEmail) setResolvedEmail(userEmail);
    if (userName) setResolvedName(userName);

    if (!userEmail || !userName) {
      const emailCookie = document.cookie
        .split("; ")
        .find((r) => r.startsWith("spendwise_user_email="))
        ?.split("=")[1];
      const nameCookie = document.cookie
        .split("; ")
        .find((r) => r.startsWith("spendwise_user_name="))
        ?.split("=")[1];

      if (!userEmail && emailCookie) {
        setResolvedEmail(decodeURIComponent(emailCookie));
      }
      if (!userName && nameCookie) {
        setResolvedName(decodeURIComponent(nameCookie));
      }
    }
  }, [userEmail, userName]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
      {/* Mobile brand header */}
      <div className="flex md:hidden items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white shadow-sm">
          <Wallet className="h-4 w-4" />
        </div>
        <Link href="/" className="font-bold text-base tracking-tight">
          Spendwise
        </Link>
      </div>

      <div className="hidden md:block">
        {/* Desktop placeholder for current breadcrumb or search */}
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground/80">
          Personal Wealth & Budgeting
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <UserMenu email={resolvedEmail} name={resolvedName} />
      </div>
    </header>
  );
}
