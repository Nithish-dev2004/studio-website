"use client";

// Error boundary for the Staff Portal (/account).

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Staff portal encountered an error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-card-foreground">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We were unable to load your workspace data. Please verify your connection or try again.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
