"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteDialog } from "@/components/transactions/delete-dialog";
import { createClient } from "@/lib/supabase/client";
import { useCurrency } from "@/components/providers/currency-provider";
import { CurrencyCode } from "@/lib/utils";
import { exportTransactionsToCSV } from "@/lib/csv-export";
import { Profile } from "@/types/database";
import { isDemoMode, disableDemoMode, demoStore } from "@/lib/demo-data";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current user profile
  useEffect(() => {
    async function loadUser() {
      if (isDemoMode()) {
        const emailCookie = document.cookie
          .split("; ")
          .find((r) => r.startsWith("spendwise_user_email="))
          ?.split("=")[1];
        const nameCookie = document.cookie
          .split("; ")
          .find((r) => r.startsWith("spendwise_user_name="))
          ?.split("=")[1];

        setEmail(emailCookie ? decodeURIComponent(emailCookie) : "demo@spendwise.app");
        setFullName(nameCookie ? decodeURIComponent(nameCookie) : "Aarav Sharma");
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          const profileRow = profile as Profile | null;
          if (profileRow) {
            setFullName(profileRow.full_name || "");
            if (profileRow.currency) {
              setCurrency(profileRow.currency as CurrencyCode);
            }
          }
        }
      } catch {}
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);

      if (isDemoMode()) {
        document.cookie = `spendwise_user_name=${fullName}; path=/; max-age=2592000; SameSite=Lax`;
        toast.success("Profile updated successfully (Demo Mode)");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase
        .from("profiles") as any)
        .update({
          full_name: fullName,
          currency: currency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw new Error(error.message);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      if (isDemoMode()) {
        const exportPayload = {
          exportedAt: new Date().toISOString(),
          user: { email: "demo@spendwise.app", fullName: fullName || "Aarav Sharma" },
          currency,
          transactions: demoStore.getTransactions({ page: 1, pageSize: 1000 }).items,
          categories: demoStore.getCategories(),
          budgets: demoStore.getBudgets(new Date().getMonth() + 1, new Date().getFullYear()),
          trips: demoStore.getTrips(),
        };

        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(exportPayload, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
          "download",
          `spendwise-backup-${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        toast.success("JSON data export downloaded");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [txs, categories, budgets, trips] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("categories").select("*").eq("user_id", user.id),
        supabase.from("budgets").select("*").eq("user_id", user.id),
        supabase.from("trips").select("*").eq("user_id", user.id),
      ]);

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: { email, fullName },
        currency,
        transactions: txs.data || [],
        categories: categories.data || [],
        budgets: budgets.data || [],
        trips: trips.data || [],
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `spendwise-backup-${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("JSON data export downloaded");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleExportCSV = async () => {
    try {
      if (isDemoMode()) {
        const txs = demoStore.getTransactions({ page: 1, pageSize: 1000 }).items;
        exportTransactionsToCSV(
          txs,
          `spendwise-ledger-${new Date().toISOString().split("T")[0]}.csv`
        );
        toast.success("CSV transaction ledger exported (Demo Mode)");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txs } = await supabase
        .from("transactions")
        .select(
          `
          *,
          category:categories(id, name, color, icon),
          trip:trips(id, name, destination)
        `
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (txs && txs.length > 0) {
        exportTransactionsToCSV(
          txs as any,
          `spendwise-ledger-${new Date().toISOString().split("T")[0]}.csv`
        );
        toast.success("CSV transaction ledger exported");
      } else {
        toast.info("No transactions to export");
      }
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      if (isDemoMode()) {
        disableDemoMode();
        await fetch("/api/auth/demo-session", { method: "DELETE" }).catch(() => {});
        toast.success("Demo session cleared");
        router.push("/login");
        router.refresh();
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Delete user's cascading records
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("budgets").delete().eq("user_id", user.id);
      await supabase.from("trip_items").delete().eq("user_id", user.id);
      await supabase.from("trips").delete().eq("user_id", user.id);
      await supabase.from("categories").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      await supabase.auth.signOut();
      toast.success("Your data has been wiped and account logged out");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteAccountOpen(false);
    }
  };

  const handleResetToEmpty = async () => {
    try {
      if (isDemoMode()) {
        demoStore.clearUserData(email);
        toast.success("Workspace cleared! All transactions, budgets, and trips are now empty.");
        router.refresh();
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("budgets").delete().eq("user_id", user.id);
      await supabase.from("trip_items").delete().eq("user_id", user.id);
      await supabase.from("trips").delete().eq("user_id", user.id);
      toast.success("Workspace cleared to empty.");
      router.refresh();
    } catch {
      toast.error("Failed to reset workspace");
    }
  };

  return (
    <AppShell userEmail={email} userName={fullName}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Account & Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your personal profile, currency formatting, theme, and data
          </p>
        </div>

        {/* 1. Profile Information */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Personal Profile</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Your name and account email for notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email-disabled">Email (Read Only)</Label>
                  <Input
                    id="email-disabled"
                    value={email}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={loadingProfile}
                  className="rounded-xl text-xs font-semibold"
                >
                  {loadingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. Preferences: Currency & Theme */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Customize currency display and visual appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency */}
              <div className="space-y-1.5">
                <Label htmlFor="currency-select">Default Currency</Label>
                <Select
                  value={currency}
                  onValueChange={(val: CurrencyCode) => {
                    setCurrency(val);
                    toast.success(`Currency switched to ${val}`);
                  }}
                >
                  <SelectTrigger id="currency-select">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">
                      🇮🇳 INR - Indian Rupee (₹, Lakh/Crore)
                    </SelectItem>
                    <SelectItem value="USD">🇺🇸 USD - US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR - Euro (€)</SelectItem>
                    <SelectItem value="GBP">
                      🇬🇧 GBP - British Pound (£)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Indian number formatting (1,00,000 lakh / crore) active for INR.
                </p>
              </div>

              {/* Theme */}
              <div className="space-y-1.5">
                <Label htmlFor="theme-select">Appearance Theme</Label>
                <Select
                  value={theme || "system"}
                  onValueChange={(val) => setTheme(val)}
                >
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light Theme</SelectItem>
                    <SelectItem value="dark">🌙 Dark Theme</SelectItem>
                    <SelectItem value="system">💻 System Default</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Smooth transitions with high contrast mode support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Data Export */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span>Data Export</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Download your transactions, categories, budgets, and travel plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex-1 rounded-xl text-xs font-semibold gap-2 h-11"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export Ledger (CSV)</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportJSON}
                className="flex-1 rounded-xl text-xs font-semibold gap-2 h-11"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Full Backup (JSON)</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Danger Zone */}
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Permanently wipe your financial transactions, budgets, trips, and
              account data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-background/50">
              <div>
                <p className="text-xs font-semibold text-foreground">Reset Workspace to Empty</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Wipes all transactions, budgets, and trips back to 0 while keeping your account active.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToEmpty}
                className="shrink-0 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                Reset to Empty
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-muted-foreground max-w-sm">
                Permanently delete your profile and log out completely.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteAccountOpen(true)}
                className="rounded-xl text-xs font-semibold gap-1.5 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Wipe Data & Logout</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteDialog
          open={deleteAccountOpen}
          onOpenChange={setDeleteAccountOpen}
          onConfirm={handleDeleteAccount}
          title="Permanently wipe all data?"
          description="This will irreversibly delete all transactions, budgets, travel plans, and account records. This action cannot be undone."
          isLoading={isDeleting}
        />
      </div>
    </AppShell>
  );
}
