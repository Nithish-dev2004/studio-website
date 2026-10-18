import React from "react";
import Section from "@/components/ui/Section";

export default function FeedbackLoading() {
  return (
    <Section
      asPageHeading
      eyebrow="Reviews & Thoughts"
      title="Client Feedback"
      subtitle="Hear what our clients have to say about their sessions, and leave your own review to help us continue improving."
    >
      <div className="space-y-12 animate-pulse">
        {/* Top 2-Column Skeleton */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 rounded-lg bg-card border border-border p-8" />
            <div className="h-24 rounded-lg bg-muted/40 border border-border/40" />
          </div>
          <div className="lg:col-span-7">
            <div className="h-96 rounded-lg bg-card border border-border p-8" />
          </div>
        </div>

        {/* Reviews Grid Skeleton */}
        <div className="pt-6 border-t border-border space-y-6">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-lg bg-card border border-border p-6" />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
