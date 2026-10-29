import React from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TopNav } from "./top-nav";
import { QuickAddButton } from "./quick-add-button";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

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
  return (
    <div className="min-h-[100dvh] bg-background">
      <DesktopSidebar />

      <div className="lg:pl-64 flex flex-col min-h-[100dvh]">
        <TopNav
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 animate-in fade-in-50 duration-200">
          {children}
        </main>

        <QuickAddButton />
        <MobileBottomNav />
        <TransactionFormDialog />
      </div>
    </div>
  );
}
