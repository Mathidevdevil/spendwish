"use client";

import React, { useState } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TopNav } from "./top-nav";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { BackToTop } from "@/components/ui/back-to-top";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string | null;
}

export function AppShell({
  children,
  userEmail,
  userName,
  avatarUrl,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Scroll-linked progress bar */}
      <ScrollProgress />

      {/* Collapsible Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col min-h-[100dvh] transition-all duration-200",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
        )}
      >
        <TopNav
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 animate-in fade-in-50 duration-200">
          {children}
        </main>

        {/* Floating Back to Top Button */}
        <BackToTop />

        {/* Mobile Navigation (<1024px) */}
        <MobileBottomNav />

        {/* Global Add/Edit Transaction Dialog */}
        <TransactionFormDialog />
      </div>
    </div>
  );
}
