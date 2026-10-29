"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Compass,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  Moon,
  PieChart,
  Plus,
  Receipt,
  Search,
  Settings,
  Sun,
  Laptop,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionModal } from "@/hooks/use-transaction-modal";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Navigation" | "Actions" | "Preferences";
  onSelect: () => void;
  shortcut?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const items: CommandItem[] = [
    {
      id: "add-tx",
      title: "Add Transaction",
      description: "Quickly record a new income or expense",
      icon: Plus,
      category: "Actions",
      shortcut: "N",
      onSelect: () => {
        onOpenChange(false);
        transactionModal.open();
      },
    },
    {
      id: "nav-dash",
      title: "Go to Dashboard",
      icon: LayoutDashboard,
      category: "Navigation",
      onSelect: () => {
        onOpenChange(false);
        router.push("/");
      },
    },
    {
      id: "nav-tx",
      title: "Go to Transactions",
      icon: Receipt,
      category: "Navigation",
      onSelect: () => {
        onOpenChange(false);
        router.push("/transactions");
      },
    },
    {
      id: "nav-budgets",
      title: "Go to Budgets",
      icon: PieChart,
      category: "Navigation",
      onSelect: () => {
        onOpenChange(false);
        router.push("/budgets");
      },
    },
    {
      id: "nav-trips",
      title: "Go to Travel Plans",
      icon: Compass,
      category: "Navigation",
      onSelect: () => {
        onOpenChange(false);
        router.push("/trips");
      },
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      icon: Settings,
      category: "Navigation",
      onSelect: () => {
        onOpenChange(false);
        router.push("/settings");
      },
    },
    {
      id: "theme-dark",
      title: "Switch to Dark Theme",
      icon: Moon,
      category: "Preferences",
      onSelect: () => {
        onOpenChange(false);
        setTheme("dark");
      },
    },
    {
      id: "theme-light",
      title: "Switch to Light Theme",
      icon: Sun,
      category: "Preferences",
      onSelect: () => {
        onOpenChange(false);
        setTheme("light");
      },
    },
    {
      id: "theme-system",
      title: "Use System Theme",
      icon: Laptop,
      category: "Preferences",
      onSelect: () => {
        onOpenChange(false);
        setTheme("system");
      },
    },
  ];

  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  // Handle arrow keys and enter
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].onSelect();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 max-w-lg overflow-hidden rounded-[20px] border border-border/80 bg-surface shadow-2xl backdrop-blur-xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search input field */}
        <div className="flex items-center px-4 border-b border-border/70 h-14">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (e.g. 'Add', 'Dark')"
            className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-surface-elevated border border-border/60 rounded">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs sm:text-sm select-none",
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20"
                      : "text-foreground hover:bg-surface-elevated"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-surface-elevated text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono text-muted-foreground ml-2 shrink-0">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border/60 bg-surface-elevated/40 text-[11px] text-muted-foreground flex justify-between items-center">
          <span>Use ↑ ↓ to navigate</span>
          <span>↵ to execute</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

