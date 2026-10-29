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
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <TopNav
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>

        <QuickAddButton />
        <MobileBottomNav />
        <TransactionFormDialog />
      </div>
    </div>
  );
}
