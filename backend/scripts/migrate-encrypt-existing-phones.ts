// One-time migration script: Encrypts existing plain phone numbers in the database.
//
// Usage:
//   npm run migrate:phones
//   or: node --env-file=.env.local --experimental-strip-types scripts/migrate-encrypt-existing-phones.ts
//
// What it does:
// 1. Reads ENCRYPTION_KEY and HASH_KEY from the environment.
// 2. Finds all rows in `bookings`, `contacts`, and `event_consultations` where
//    plain `phone` exists and `phone_encrypted` is still null.
// 3. Normalizes and encrypts each number with AES-256-GCM.
// 4. Computes the HMAC-SHA256 blind index hash for `phone_hash`.
// 5. Updates the row with `phone_encrypted` and `phone_hash`, and clears plain `phone` to null.
// 6. Never logs plain phone numbers or keys.

import { createClient } from "@supabase/supabase-js";
import { encryptPhone, hashPhone } from "../src/lib/crypto/phone.ts";

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Starting one-time phone encryption migration...");

  const tables = ["bookings", "contacts", "event_consultations"] as const;
  const summary: Record<string, { total: number; migrated: number; failed: number }> = {};

  for (const table of tables) {
    summary[table] = { total: 0, migrated: 0, failed: 0 };

    // Fetch rows that need migration
    const { data: rows, error } = await supabase
      .from(table)
      .select("id, phone, phone_encrypted")
      .not("phone", "is", null);

    if (error) {
      console.warn(`Could not query table "${table}": ${error.message} (Skipping)`);
      continue;
    }

    const unmigrated = (rows || []).filter(
      (r: { phone_encrypted?: string | null }) => !r.phone_encrypted,
    );
    summary[table].total = unmigrated.length;

    for (const row of unmigrated) {
      if (!row.phone) continue;

      try {
        const encrypted = encryptPhone(row.phone);
        const hash = hashPhone(row.phone);

        const { error: updateError } = await supabase
          .from(table)
          .update({
            phone_encrypted: encrypted,
            phone_hash: hash,
            phone: null, // Clear plain phone number
          })
          .eq("id", row.id);

        if (updateError) {
          summary[table].failed++;
          console.error(`Failed to update row ID ${row.id} in ${table}: ${updateError.message}`);
        } else {
          summary[table].migrated++;
        }
      } catch (err) {
        summary[table].failed++;
        console.error(
          `Skipped invalid phone format for row ID ${row.id} in ${table}: ${
            err instanceof Error ? err.message : "Encryption error"
          }`,
        );
      }
    }
  }

  console.log("\n================ MIGRATION REPORT ================");
  for (const [table, stats] of Object.entries(summary)) {
    console.log(
      `- Table ${table}: ${stats.migrated}/${stats.total} rows encrypted and migrated (${stats.failed} failed/skipped)`,
    );
  }
  console.log("==================================================");
  console.log("Migration finished successfully.");
}

run().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
