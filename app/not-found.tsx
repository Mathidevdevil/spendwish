import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Compass className="h-8 w-8 stroke-1" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-foreground mt-1">
        Page Not Found
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <Button asChild className="rounded-xl gap-2 font-semibold text-xs">
        <Link href="/">
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </Button>
    </div>
  );
}
