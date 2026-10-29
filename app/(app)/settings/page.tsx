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
  Sparkles,
  Sun,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current user profile prioritizing real Supabase session
  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && !user.email?.includes("@spendwise.app")) {
          setEmail(user.email || "");
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const profileRow = profile as Profile | null;
          setFullName(
            profileRow?.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            ""
          );
          setAvatarUrl(
            profileRow?.avatar_url ||
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null
          );
          if (profileRow?.currency) {
            setCurrency(profileRow.currency as CurrencyCode);
          }
          setIsDemo(false);
          return;
        }
      } catch {}

      if (isDemoMode()) {
        setIsDemo(true);
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
      }
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);

      if (isDemo) {
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
      if (isDemo) {
        const exportPayload = {
          exportedAt: new Date().toISOString(),
          user: { email, fullName },
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
      if (isDemo) {
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

      if (isDemo) {
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
      if (isDemo) {
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
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Account & Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your personal profile, currency formatting, theme, and data
          </p>
        </div>

        {/* Demo Mode Notice Banner */}
        {isDemo && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <strong className="font-semibold">Demo Sandbox Active</strong>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  You are currently exploring Spendwise in Demo Mode. Changes made here are saved locally to your browser and isolated from production accounts.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAccount}
              className="border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 text-xs shrink-0 rounded-xl font-medium"
            >
              Exit Demo Sandbox
            </Button>
          </div>
        )}

        {/* 1. Profile Information */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Personal Profile</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Your identity and account credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Avatar Card Header */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <Avatar className="h-14 w-14 border-2 border-border shadow-xs">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || "User"} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {(fullName || email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className="font-bold text-base text-foreground truncate">
                  {fullName || "User"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
                {isDemo ? (
                  <span className="inline-block px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                    Demo Mode
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                    Verified Account
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email-disabled">Email (Read Only)</Label>
                  <Input
                    id="email-disabled"
                    value={email}
                    disabled
                    className="h-10 bg-muted/60 text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={loadingProfile}
                  className="rounded-xl text-xs font-semibold h-10 px-4"
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
              Configure currency notation and display mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="currency-select">Default Currency</Label>
                <Select
                  value={currency}
                  onValueChange={(val: CurrencyCode) => {
                    setCurrency(val);
                    toast.success(`Currency updated to ${val}`);
                  }}
                >
                  <SelectTrigger id="currency-select" className="h-10">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">
                      🇮🇳 INR (₹) — Indian Rupee (Lakh / Crore)
                    </SelectItem>
                    <SelectItem value="USD">🇺🇸 USD ($) — US Dollar</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR (€) — Euro</SelectItem>
                    <SelectItem value="GBP">🇬🇧 GBP (£) — British Pound</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Indian Lakh/Crore grouping (e.g. ₹1,50,000) applied on INR.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="h-10 text-xs gap-1.5 font-medium rounded-xl"
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Light</span>
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="h-10 text-xs gap-1.5 font-medium rounded-xl"
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="h-10 text-xs gap-1.5 font-medium rounded-xl"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>System</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Adaptive dark and light mode palette.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Data Export & Backup */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span>Data Export & Backup</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Download your full data package or CSV transaction ledger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="h-12 justify-start gap-3 rounded-xl border-border hover:bg-accent font-medium text-xs"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Export CSV Ledger</p>
                  <p className="text-[10px] text-muted-foreground">
                    Spreadsheet-ready list of all transactions
                  </p>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExportJSON}
                className="h-12 justify-start gap-3 rounded-xl border-border hover:bg-accent font-medium text-xs"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Complete Backup (JSON)</p>
                  <p className="text-[10px] text-muted-foreground">
                    Full dump of budgets, categories, and trips
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Reset & Danger Zone */}
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Irreversible account and workspace data actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-background/60">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Reset Workspace to Clean State
                </p>
                <p className="text-xs text-muted-foreground">
                  Delete all transactions, budgets, and trips while keeping categories and profile intact.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToEmpty}
                className="h-9 text-xs font-semibold rounded-xl shrink-0"
              >
                Reset to Empty
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-destructive/20 bg-destructive/10">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-destructive">
                  Delete Account & Wipe Everything
                </p>
                <p className="text-xs text-muted-foreground">
                  Permanently erase your user profile and all financial logs.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteAccountOpen(true)}
                className="h-9 text-xs font-semibold rounded-xl shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Permanently Delete Account?"
        description="This action cannot be undone. All your personal data, transaction history, categories, budgets, and travel plans will be permanently purged from the database."
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </>
  );
}
