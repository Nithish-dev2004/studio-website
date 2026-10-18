import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.trim().split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
});

function cleanFeedbackMessage(text) {
  if (!text) return "";
  let cleaned = String(text)
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .trim();

  cleaned = cleaned.replace(/^(&quot;|["'“”‘’`\s])+/gi, "");
  cleaned = cleaned.replace(/(&quot;|["'“”‘’`\s])+$/gi, "");

  return cleaned.trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data: rows, error } = await supabase.from("feedback").select("id, message");

if (!error && rows) {
  console.log(`Found ${rows.length} rows to sanitize...`);
  for (const row of rows) {
    const cleaned = cleanFeedbackMessage(row.message);
    if (cleaned !== row.message) {
      console.log(`Updating row ${row.id}...`);
      console.log(`Before: ${row.message}`);
      console.log(`After:  ${cleaned}`);
      const { error: updateErr } = await supabase
        .from("feedback")
        .update({ message: cleaned })
        .eq("id", row.id);
      if (updateErr) console.error("Update error:", updateErr);
      else console.log("✓ Successfully cleaned in Supabase!");
    } else {
      console.log(`Row ${row.id} already clean.`);
    }
  }
} else {
  console.error("Fetch error:", error);
}
