"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Camera,
  Check,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Lock,
  Moon,
  Palette,
  RotateCcw,
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
import { getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

type SettingsSection = "profile" | "preferences" | "data" | "danger";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current user profile
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

      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("budgets").delete().eq("user_id", user.id);
      await supabase.from("trip_items").delete().eq("user_id", user.id);
      await supabase.from("trips").delete().eq("user_id", user.id);
      await supabase.from("categories").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      await supabase.auth.signOut();
      toast.success("Your data has been erased and account logged out");
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
      toast.success("Workspace reset to empty state.");
      router.refresh();
    } catch {
      toast.error("Failed to reset workspace");
    }
  };

  const navItems = [
    { id: "profile" as SettingsSection, label: "Profile", icon: User },
    { id: "preferences" as SettingsSection, label: "Preferences", icon: Wallet },
    { id: "data" as SettingsSection, label: "Data & Export", icon: Download },
    { id: "danger" as SettingsSection, label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your personal profile, visual theme, currency notation, and data exports
          </p>
        </div>

        {/* Demo Mode Notice Banner */}
        {isDemo && (
          <div className="p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
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

        {/* Main Settings Layout: Left Sub-navigation on Desktop, Sectioned Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Sub-Navigation */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none p-1 bg-surface rounded-[20px] border border-border/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-left w-full",
                      isSelected
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Column: Sectioned Cards */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. Profile Information */}
            <Card
              id="profile"
              className="rounded-[24px] border-border/80 bg-surface shadow-xs p-6 sm:p-7 space-y-6"
              style={{
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
              }}
            >
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Personal Profile</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your identity and account credentials
                </p>
              </div>

              {/* Avatar Uploader Placeholder + User Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated border border-border/60">
                <div className="relative group/avatar cursor-pointer">
                  <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || "User"} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg font-sans">
                      {getInitials(fullName || email || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  <h3 className="font-bold text-base text-foreground truncate">
                    {fullName || "User"}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                  {isDemo ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/25">
                      Demo Mode
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/25">
                      Verified Account
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      className="h-10 text-xs sm:text-sm rounded-xl bg-surface"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email-disabled" className="text-xs font-semibold text-muted-foreground">
                      Email Address (Read Only)
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="email-disabled"
                        value={email}
                        disabled
                        className="h-10 text-xs sm:text-sm rounded-xl bg-surface-elevated/70 text-muted-foreground pr-8"
                      />
                      <Lock className="absolute right-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={loadingProfile}
                    className="btn-gradient rounded-xl text-xs font-semibold h-9 px-5"
                  >
                    {loadingProfile ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2. Preferences: Currency & Theme Visual Cards */}
            <Card
              id="preferences"
              className="rounded-[24px] border-border/80 bg-surface shadow-xs p-6 sm:p-7 space-y-6"
              style={{
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
              }}
            >
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span>Preferences</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure visual theme and currency formatting
                </p>
              </div>

              <div className="space-y-6">
                {/* Theme Selector as Three Visual Cards */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Color Appearance
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Light Mode Visual Card */}
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all space-y-3 relative overflow-hidden group",
                        theme === "light"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 bg-surface-elevated/60 hover:border-border"
                      )}
                    >
                      <div className="h-16 rounded-xl bg-white border border-slate-200 p-2 space-y-1 shadow-xs">
                        <div className="h-2 w-12 rounded bg-slate-300" />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Sun className="h-3.5 w-3.5 text-amber-500" />
                          <span>Light</span>
                        </div>
                        {theme === "light" && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Dark Mode Visual Card */}
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all space-y-3 relative overflow-hidden group",
                        theme === "dark"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 bg-surface-elevated/60 hover:border-border"
                      )}
                    >
                      <div className="h-16 rounded-xl bg-[#0A0D12] border border-white/10 p-2 space-y-1 shadow-xs">
                        <div className="h-2 w-12 rounded bg-white/20" />
                        <div className="h-1.5 w-full rounded bg-white/10" />
                        <div className="h-1.5 w-3/4 rounded bg-white/10" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Moon className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Dark</span>
                        </div>
                        {theme === "dark" && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* System Mode Visual Card */}
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all space-y-3 relative overflow-hidden group",
                        theme === "system"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 bg-surface-elevated/60 hover:border-border"
                      )}
                    >
                      <div className="h-16 rounded-xl overflow-hidden border border-border flex shadow-xs">
                        <div className="w-1/2 bg-white p-2 space-y-1">
                          <div className="h-2 w-8 rounded bg-slate-300" />
                          <div className="h-1.5 w-full rounded bg-slate-200" />
                        </div>
                        <div className="w-1/2 bg-[#0A0D12] p-2 space-y-1">
                          <div className="h-2 w-8 rounded bg-white/20" />
                          <div className="h-1.5 w-full rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Palette className="h-3.5 w-3.5 text-emerald-400" />
                          <span>System</span>
                        </div>
                        {theme === "system" && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Currency Notation */}
                <div className="space-y-1.5 max-w-sm">
                  <Label htmlFor="currency-select" className="text-xs font-semibold text-muted-foreground">
                    Universal Currency Notation
                  </Label>
                  <Select
                    value={currency}
                    onValueChange={(val: CurrencyCode) => {
                      setCurrency(val);
                      toast.success(`Currency format switched to ${val}`);
                    }}
                  >
                    <SelectTrigger id="currency-select" className="h-10 text-xs sm:text-sm rounded-xl bg-surface">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border/80">
                      <SelectItem value="INR" className="text-xs">
                        🇮🇳 INR (₹) — Indian Rupee (Lakh / Crore)
                      </SelectItem>
                      <SelectItem value="USD" className="text-xs">
                        🇺🇸 USD ($) — US Dollar
                      </SelectItem>
                      <SelectItem value="EUR" className="text-xs">
                        🇪🇺 EUR (€) — Euro
                      </SelectItem>
                      <SelectItem value="GBP" className="text-xs">
                        🇬🇧 GBP (£) — British Pound
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Indian numbering grouping (₹1,50,000) applied on INR.
                  </p>
                </div>
              </div>
            </Card>

            {/* 3. Data Export & Backup */}
            <Card
              id="data"
              className="rounded-[24px] border-border/80 bg-surface shadow-xs p-6 sm:p-7 space-y-5"
              style={{
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
              }}
            >
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <span>Data Export & Portability</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download full offline backup packages or spreadsheet CSV ledger
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="h-14 justify-start gap-3 rounded-2xl border-border/80 hover:bg-surface-elevated font-medium text-xs p-3.5"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-foreground">Export CSV Ledger</p>
                    <p className="text-[10px] text-muted-foreground">
                      Spreadsheet-ready list of all transactions
                    </p>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportJSON}
                  className="h-14 justify-start gap-3 rounded-2xl border-border/80 hover:bg-surface-elevated font-medium text-xs p-3.5"
                >
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-foreground">Complete Backup (JSON)</p>
                    <p className="text-[10px] text-muted-foreground">
                      Full snapshot of transactions, budgets, and trips
                    </p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* 4. Danger Zone */}
            <Card
              id="danger"
              className="rounded-[24px] border-rose-500/30 bg-rose-500/5 shadow-xs p-6 sm:p-7 space-y-5"
            >
              <div className="border-b border-rose-500/20 pb-3">
                <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Danger Zone</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Irreversible actions for your workspace data and user account
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Reset Workspace */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-surface">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">
                      Reset Workspace to Clean State
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wipe all transactions, budgets, and travel plans while preserving your account and categories.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToEmpty}
                    className="h-9 text-xs font-semibold rounded-xl shrink-0 border-border/80"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>Reset to Empty</span>
                  </Button>
                </div>

                {/* Delete Account */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-rose-500/25 bg-rose-500/10">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-rose-400">
                      Delete Account & Purge Everything
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Permanently erase your identity, settings, and financial records from the database.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteAccountOpen(true)}
                    className="h-9 text-xs font-semibold rounded-xl shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
