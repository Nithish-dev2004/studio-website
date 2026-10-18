// Server-rendered /feedback page: displays approved feedback, review summary, and submission form.

import React from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackList from "@/components/feedback/FeedbackList";
import FeedbackSummary from "@/components/feedback/FeedbackSummary";
import Section from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { createMetadata } from "@/lib/metadata";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cleanFeedbackMessage } from "@/lib/validation";
import type { PublicFeedbackItem } from "@/types";

export const revalidate = 0; // Fresh review counts and submissions

export const metadata = createMetadata({
  title: "Client Feedback & Reviews",
  description: `Read authentic reviews from clients of ${siteConfig.name}, or share your own photography and studio experience.`,
  path: "/feedback",
});

/** Basic HTML entity escaping for server-rendered data (strips script injection) */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function FeedbackPage() {
  let initialFeedback: PublicFeedbackItem[] = [];
  let totalCount = 0;
  let averageRating = 0;
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  try {
    const supabase = createSupabaseAdmin();

    // 1. Fetch first 9 approved feedback entries
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("id, name, rating, service, message, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(0, 8);

    if (!feedbackError && feedbackData) {
      initialFeedback = feedbackData.map((fb) => ({
        id: fb.id,
        name: escapeHtml(fb.name),
        rating: fb.rating,
        service: fb.service ? escapeHtml(fb.service) : null,
        message: cleanFeedbackMessage(fb.message),
        created_at: fb.created_at,
      }));
    }

    // 2. Compute aggregate ratings across all approved entries
    const { data: allApproved, error: allApprovedError } = await supabase
      .from("feedback")
      .select("rating")
      .eq("status", "approved");

    if (!allApprovedError && allApproved) {
      totalCount = allApproved.length;
      if (totalCount > 0) {
        const sum = allApproved.reduce((acc, curr) => {
          const r = curr.rating;
          if (r >= 1 && r <= 5) ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
          return acc + r;
        }, 0);
        averageRating = Number((sum / totalCount).toFixed(1));
      }
    }
  } catch (err) {
    // If table doesn't exist yet, page renders gracefully with 0 reviews
    console.warn("Feedback table query notice:", err instanceof Error ? err.message : err);
  }

  return (
    <Section
      asPageHeading
      eyebrow="Reviews & Thoughts"
      title="Client Feedback"
      subtitle="Hear what our clients have to say about their sessions, and leave your own review to help us continue improving."
    >
      <div className="space-y-12">
        {/* Top Section: Summary & Submission Form in Responsive 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <FeedbackSummary
              totalCount={totalCount}
              averageRating={averageRating}
              distribution={ratingDistribution}
            />

            <div className="rounded-lg border border-border/60 bg-muted/30 p-5 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Review Moderation Policy</p>
              <p>
                Every submission is reviewed by our team before publication to maintain a respectful,
                helpful space. Your email address is never displayed or shared.
              </p>
            </div>
          </div>

          {/* Right Column: Submission Form */}
          <div className="lg:col-span-7">
            <FeedbackForm />
          </div>
        </div>

        {/* Bottom Section: Approved Reviews List */}
        <div className="pt-6 border-t border-border">
          <FeedbackList
            initialFeedback={initialFeedback}
            initialTotal={totalCount}
          />
        </div>
      </div>
    </Section>
  );
}
