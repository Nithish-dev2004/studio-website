// Supabase client for SERVER code only.
//
// 1) createSupabaseServerClient: Uses cookie storage via @supabase/ssr to verify the logged-in user.
// 2) createSupabaseAdmin: Uses SUPABASE_SERVICE_ROLE_KEY to perform privileged reads/writes,
//    bypassing RLS for admin dashboard operations.
//
// The `import "server-only"` below causes the build to fail if this file is accidentally imported
// into any browser/client bundle, preventing secret key leakage.

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a server client with the visitor's / admin's cookie session.
 * Used to check who is currently signed in via Supabase Auth.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This is expected and safe to ignore when middleware refreshes cookies.
        }
      },
    },
  });
}

/**
 * Creates an admin client using the secret service role key.
 * Only call this inside server-side admin data loaders or Server Actions.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin configuration: Set SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
