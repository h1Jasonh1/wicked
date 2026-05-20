import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: SupabaseClient<Database> | null = null;

/**
 * Cookie-less anon client for *public* catalogue reads (products,
 * categories, etc.). Touching cookies in the root layout via
 * getSupabaseServerClient() forces every page to render dynamically;
 * this client lets a Server Component pull catalogue data without
 * opting the layout into the dynamic path. No session, no refresh.
 */
export function getSupabasePublicClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;

  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cached;
}
