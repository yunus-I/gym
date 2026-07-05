import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing env var: ${name}`);
  }
  return val;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
