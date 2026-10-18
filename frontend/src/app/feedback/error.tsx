"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";

export default function FeedbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Feedback page error:", error);
  }, [error]);

  return (
    <Section asPageHeading eyebrow="Error" title="Could Not Load Feedback">
      <Card className="mx-auto max-w-lg border-destructive/20 bg-card p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold text-foreground">Something went wrong</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We encountered an issue loading our client feedback. Please check your connection and try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => reset()} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Button href="/" variant="outline">
            Return Home
          </Button>
        </div>
      </Card>
    </Section>
  );
}
