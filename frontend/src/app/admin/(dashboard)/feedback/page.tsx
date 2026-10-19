// Admin Feedback Moderation Page (/admin/feedback)
// Protected by requireAdmin(). Lists all feedback entries with status filtering,
// search, approval, hiding, and permanent deletion.

import React from "react";
import FeedbackTable from "@/components/admin/FeedbackTable";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { AdminFeedbackItem } from "@/types";

export const revalidate = 0; // Fresh feedback on action or reload

export const metadata = {
  title: "Client Feedback Moderation | Admin Console",
};

export default async function AdminFeedbackPage() {
  await requireAdmin();

  let feedbackItems: AdminFeedbackItem[] = [];

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      feedbackItems = data as AdminFeedbackItem[];
    }
  } catch (err) {
    console.error("Admin feedback query error:", err);
  }

  return <FeedbackTable feedback={feedbackItems} />;
}
