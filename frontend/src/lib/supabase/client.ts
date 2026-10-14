// Supabase client for the BROWSER. It uses the public "anon" key, which is safe to expose
// because Row Level Security (see supabase/schema.sql) blocks it from reading or writing
// the bookings and contacts tables.
//
// Nothing uses this yet. It is here for later, for example when you add:
//  - an admin login (Supabase Auth)
//  - public data such as a portfolio table (with its own RLS policy)
//  - the mobile app, which can use the same project

import { createClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return createClient(url, anonKey);
}
