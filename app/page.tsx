import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell userEmail="user@spendwise.app" userName="Demo User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Overview of your cash flow, budgets, and investments.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
