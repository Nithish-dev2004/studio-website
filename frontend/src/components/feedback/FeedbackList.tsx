"use client";

import React, { useState } from "react";
import { Calendar, MessageSquareHeart } from "lucide-react";
import StarRating from "./StarRating";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cleanFeedbackMessage } from "@/lib/validation";
import type { PublicFeedbackItem } from "@/types";

interface FeedbackListProps {
  initialFeedback: PublicFeedbackItem[];
  initialTotal: number;
}

const SERVICE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  portrait: "Portrait",
  product: "Product",
  events: "Events",
  "studio rental": "Studio Rental",
  other: "General",
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function FeedbackList({
  initialFeedback,
  initialTotal,
}: FeedbackListProps) {
  const [items, setItems] = useState<PublicFeedbackItem[]>(initialFeedback);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotal > initialFeedback.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/feedback?page=${nextPage}&limit=9`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.ok) {
        setItems((prev) => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(json.pagination.hasMore);
      }
    } catch (err) {
      console.error("Failed to load more feedback:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Client Stories & Reviews
        </h2>
        <p className="text-xs text-muted-foreground">
          Genuine verified feedback from clients we have had the honor to work with.
        </p>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="border-border bg-card p-10 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MessageSquareHeart className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
            Be the First to Share Your Feedback
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            No feedback has been published yet. If you have worked with us, please share your thoughts using the form above!
          </p>
        </Card>
      )}

      {/* Feedback Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
      {items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((fb) => (
            <Card
              key={fb.id}
              className="flex flex-col justify-between border-border bg-card p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                {/* Top Row: Stars + Service Tag */}
                <div className="flex items-start justify-between gap-2">
                  <StarRating value={fb.rating} readOnly size="sm" />
                  {fb.service && (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent shrink-0">
                      {SERVICE_LABELS[fb.service] || fb.service}
                    </span>
                  )}
                </div>

                {/* Feedback Message */}
                <p className="mt-3.5 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {cleanFeedbackMessage(fb.message)}
                </p>
              </div>

              {/* Bottom Row: Client Name + Date */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{fb.name}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(fb.created_at)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            aria-busy={isLoadingMore}
            className="min-w-36"
          >
            {isLoadingMore ? "Loading More..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}
