import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const authData = await getCurrentUser();

  return (
    <AppShell
      userEmail={authData?.user?.email}
      userName={authData?.profile?.full_name}
      avatarUrl={authData?.profile?.avatar_url}
    >
      <DashboardView />
    </AppShell>
  );
}
