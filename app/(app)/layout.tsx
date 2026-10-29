import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getCurrentUser();

  return (
    <AppShell
      userEmail={authData?.user?.email}
      userName={authData?.profile?.full_name}
      avatarUrl={authData?.profile?.avatar_url}
    >
      {children}
    </AppShell>
  );
}

