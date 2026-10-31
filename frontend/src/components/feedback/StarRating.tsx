"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "1 star - Poor",
  2: "2 stars - Fair",
  3: "3 stars - Good",
  4: "4 stars - Very Good",
  5: "5 stars - Excellent",
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  className,
  id,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6 sm:h-5 sm:w-5",
    lg: "h-7 w-7",
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  if (readOnly) {
    return (
      <div
        className={cn("inline-flex items-center gap-1", className)}
        aria-label={`${value} out of 5 stars`}
        role="img"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(value);
          return (
            <Star
              key={star}
              className={cn(
                starSizes[size],
                isFilled
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/30 fill-transparent",
                "transition-colors",
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Star rating"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={RATING_LABELS[star]}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  onChange?.(Math.min(5, (value || 0) + 1));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  onChange?.(Math.max(1, (value || 1) - 1));
                }
              }}
              className="group relative flex h-11 w-11 items-center justify-center rounded-lg p-2 transition-transform hover:scale-110 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              <Star
                className={cn(
                  starSizes[size],
                  isFilled
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/40 fill-transparent group-hover:text-accent/60",
                  "transition-colors",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      {activeValue > 0 && (
        <span className="text-xs font-medium text-accent animate-in fade-in duration-150">
          {RATING_LABELS[activeValue]}
        </span>
      )}
    </div>
  );
}
