// POST & GET /api/feedback
// Receives feedback submissions, validates them, saves with status 'pending' via service role.
// GET returns only approved feedback with sanitized output, no emails or pending status exposed.

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cleanFeedbackMessage, validateFeedback } from "@/lib/validation";
import type { ApiResponse, FeedbackFormData, PublicFeedbackItem } from "@/types";

type PostReply = ApiResponse<FeedbackFormData>;

const SUCCESS_MESSAGE = "Thank you! Your feedback will appear after review.";

/** Basic HTML entity escaping to ensure no script injection */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  // 1) Rate limit: at most 3 submissions per IP address every hour (in dev: 100 for easy testing)
  const ip = getClientIp(request);
  const limit = checkRateLimit(`feedback:${ip}`, {
    max: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json<PostReply>(
      { ok: false, message: "Too many feedback submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2) Parse JSON body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<PostReply>(
      { ok: false, message: "Invalid request format." },
      { status: 400 },
    );
  }

  // 3) Honeypot: trap bots that fill the hidden "website" field
  if (typeof body === "object" && body !== null) {
    const trap = (body as Record<string, unknown>).website;
    if (typeof trap === "string" && trap.trim() !== "") {
      // Return 201 success so the bot is misled, but save nothing
      return NextResponse.json<PostReply>(
        { ok: true, message: SUCCESS_MESSAGE },
        { status: 201 },
      );
    }
  }

  // 4) Server-side Zod validation
  const result = validateFeedback(body);
  if (!result.valid) {
    return NextResponse.json<PostReply>(
      { ok: false, message: "Please fix the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }

  const data = result.data;

  // 5) Insert into Supabase with status 'pending' using service role key
  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("feedback").insert({
      name: data.name.trim(),
      email: data.email && data.email.trim() !== "" ? data.email.trim().toLowerCase() : null,
      rating: data.rating,
      service: data.service && data.service.trim() !== "" ? data.service.trim() : null,
      message: cleanFeedbackMessage(data.message),
      status: "pending",
      // created_at defaults to now(), approved_at is null
    });

    if (error) {
      console.error("Database feedback insert error:", error.message);
      throw error;
    }
  } catch (error) {
    console.error(
      "Saving feedback failed:",
      error instanceof Error ? error.message : "Database error",
    );
    return NextResponse.json<PostReply>(
      { ok: false, message: "Sorry, something went wrong on our side. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json<PostReply>(
    { ok: true, message: SUCCESS_MESSAGE },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "9", 10) || 9));
    const ratingParam = searchParams.get("rating");
    const filterRating = ratingParam && ratingParam !== "all" ? parseInt(ratingParam, 10) : null;

    const supabase = createSupabaseAdmin();

    // Base query for approved feedback ONLY
    let query = supabase
      .from("feedback")
      .select("id, name, rating, service, message, created_at", { count: "exact" })
      .eq("status", "approved");

    if (filterRating && filterRating >= 1 && filterRating <= 5) {
      query = query.eq("rating", filterRating);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.warn("Feedback table query notice:", error.message);
      return NextResponse.json({
        ok: true,
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        stats: {
          totalCount: 0,
          averageRating: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    // Also get overall approved stats (average rating and total approved count)
    const { data: allApproved, error: statsError } = await supabase
      .from("feedback")
      .select("rating")
      .eq("status", "approved");

    let totalApproved = 0;
    let averageRating = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (!statsError && allApproved) {
      totalApproved = allApproved.length;
      if (totalApproved > 0) {
        const sum = allApproved.reduce((acc, curr) => {
          const r = curr.rating;
          if (r >= 1 && r <= 5) ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
          return acc + r;
        }, 0);
        averageRating = Number((sum / totalApproved).toFixed(1));
      }
    }

    // Sanitize message & name to prevent HTML injection
    const sanitizedItems: PublicFeedbackItem[] = (data || []).map((item) => ({
      id: item.id,
      name: escapeHtml(item.name),
      rating: item.rating,
      service: item.service ? escapeHtml(item.service) : null,
      message: cleanFeedbackMessage(item.message),
      created_at: item.created_at,
    }));

    const totalFiltered = count ?? 0;
    const totalPages = Math.ceil(totalFiltered / limit);

    return NextResponse.json({
      ok: true,
      data: sanitizedItems,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasMore: page < totalPages,
      },
      stats: {
        totalCount: totalApproved,
        averageRating,
        distribution: ratingDistribution,
      },
    });
  } catch (err) {
    console.error("GET /api/feedback error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
