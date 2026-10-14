// Supabase client for the SERVER only. It uses the secret service role key,
// which can read and write everything and ignores Row Level Security.
//
// RULES:
//  - Only import this file from API routes (src/app/api/...) or other server code.
//  - Never put the service role key anywhere the browser can see it.
//
// The `server-only` import below makes the build FAIL if someone imports this
// file into browser code by mistake, so the key can never leak.

import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  // SUPABASE_URL is read when the server RUNS (so you can build once and set it later).
  // The older name NEXT_PUBLIC_SUPABASE_URL still works as a fallback.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // The message below is only logged on the server. Visitors just get a generic error.
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.local.",
    );
  }

  return createClient(url, serviceRoleKey, {
    // This is a backend client: no login sessions to store or refresh.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
