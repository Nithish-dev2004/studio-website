// Contact Messages Management (/admin/messages).
// Loads client inquiries securely from Supabase using the service role key,
// decrypts phone numbers on the server, and provides full search and reading capabilities.

import React from "react";
import MessagesTable from "@/components/admin/MessagesTable";
import { AdminMessageItem } from "@/components/admin/MessageDetailModal";
import { resolvePhoneNumber } from "@/lib/admin/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const supabase = createSupabaseAdmin();

  const { data: rawContacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load contacts in admin:", error.message);
  }

  const formattedMessages: AdminMessageItem[] = (rawContacts || []).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: resolvePhoneNumber(c.phone_encrypted, c.phone),
    message: c.message,
    is_read: Boolean(c.is_read),
    created_at: c.created_at,
  }));

  return <MessagesTable initialMessages={formattedMessages} />;
}
