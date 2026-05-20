import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { AddressRow, ProfileRow } from "./database.types";
import { getSupabaseServerClient } from "./server";
import type { DeliveryAddress, User } from "@/types/user";

function mapAddress(row: AddressRow): DeliveryAddress {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.full_name,
    phone: row.phone ?? "",
    line1: row.address_line_1,
    line2: row.address_line_2 ?? undefined,
    city: row.city,
    province: row.province ?? "",
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

export function mapProfile(
  authUser: SupabaseUser,
  profile: ProfileRow | null,
  addresses: AddressRow[],
): User {
  return {
    id: authUser.id,
    email: profile?.email ?? authUser.email ?? "",
    name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    addresses: addresses.map(mapAddress),
    preferences: {
      // Marketing channels are opt-in. Default to false when no profile row
      // exists yet so the user is never silently subscribed. See
      // supabase/migrations/0002_marketing_default_off.sql.
      marketingEmails: profile?.marketing_emails ?? false,
      orderSmsUpdates: profile?.order_sms_updates ?? false,
    },
    createdAt: profile?.created_at ?? authUser.created_at,
  };
}

/**
 * Returns the currently authenticated user with their profile and saved
 * delivery addresses, or null if the visitor is signed out.
 */
export async function loadCurrentUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const [profileResult, addressesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", authUser.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  return mapProfile(
    authUser,
    profileResult.data ?? null,
    addressesResult.data ?? [],
  );
}
