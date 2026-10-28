"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global root error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground antialiased font-sans">
        <div className="max-w-md text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Application Error</h2>
          <p className="text-sm text-muted-foreground">
            A critical error occurred. Please refresh or try again.
          </p>
          <Button onClick={() => reset()} className="rounded-xl">
            Reload Spendwise
          </Button>
        </div>
      </body>
    </html>
  );
}
