"use client";

import React from "react";
import StarRating from "./StarRating";
import Card from "@/components/ui/Card";

interface FeedbackSummaryProps {
  totalCount: number;
  averageRating: number;
  distribution?: Record<number, number>;
}

export default function FeedbackSummary({
  totalCount,
  averageRating,
  distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
}: FeedbackSummaryProps) {
  if (totalCount === 0) {
    return (
      <Card className="border-border bg-card/60 p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <StarRating value={5} readOnly size="md" />
        </div>
        <h3 className="mt-4 font-heading text-xl font-medium">Be Our First Reviewer</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We treat every story with care. Share your experience with Sivagangai Stories below.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="grid gap-6 sm:grid-cols-2 sm:items-center sm:gap-8">
        {/* Left Column: Big Average & Stars */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-6 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
          <span className="font-heading text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-2.5">
            <StarRating value={averageRating} readOnly size="lg" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on{" "}
            <span className="font-semibold text-foreground">{totalCount}</span>{" "}
            {totalCount === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Right Column: Rating Distribution Bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-muted-foreground shrink-0">
                  {stars} {stars === 1 ? "star" : "stars"}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${stars} stars: ${percentage}%`}
                  />
                </div>
                <span className="w-8 text-right font-medium tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
