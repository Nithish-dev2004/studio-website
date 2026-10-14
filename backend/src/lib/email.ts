// Optional email notifications with Resend.
// If RESEND_API_KEY (or NOTIFY_EMAIL_TO) is not set, this does nothing and never fails.
// An email problem must never stop a booking or message from being saved.

import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/data/site";

type Notification = {
  subject: string;
  /** Plain-text lines of the email body. */
  lines: string[];
  /** The visitor's email, so replying to the notification goes straight to them. */
  replyTo?: string;
};

/** Removes line breaks and control characters (keeps headers safe). */
function oneLine(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

export async function sendOwnerNotification({ subject, lines, replyTo }: Notification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;

  // Not configured: skip silently.
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `${siteConfig.name} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to,
      subject: oneLine(subject),
      // Plain text only: visitor input is never turned into HTML, so nothing can be injected.
      text: lines.join("\n"),
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) console.error("Email notification failed:", error.name);
  } catch {
    console.error("Email notification failed.");
  }
}
