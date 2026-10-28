"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
        {error.message || "An unexpected error occurred while processing your request."}
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} className="rounded-xl gap-2 text-xs font-semibold">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try again</span>
        </Button>
        <Button asChild variant="outline" className="rounded-xl text-xs">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
