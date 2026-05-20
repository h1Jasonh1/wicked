import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_URL } from "./env";

let cached: SupabaseClient<Database> | null = null;

/**
 * Service-role client. Bypasses Row Level Security. Use ONLY from trusted
 * server code (server actions / route handlers / cron jobs). Never import
 * this file from a client component.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !serviceRoleKey) {
    return null;
  }

  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cached;
}
