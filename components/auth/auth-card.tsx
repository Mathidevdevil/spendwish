import Link from "next/link";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Spendwise
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
