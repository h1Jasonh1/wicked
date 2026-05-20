"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AccountActionState = {
  error?: string;
  success?: string;
} | null;

function requireString(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const fullName = requireString(formData, "full_name");
  const phone = requireString(formData, "phone");
  const marketingEmails = formData.get("marketing_emails") === "on";
  // Server-side guard: SMS marketing requires a phone number on file.
  // The UI also disables the toggle, but a missing phone here is a hard no.
  const orderSmsUpdates =
    formData.get("order_sms_updates") === "on" && phone.length > 0;

  if (!fullName) {
    return { error: "Enter your full name." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      marketing_emails: marketingEmails,
      order_sms_updates: orderSmsUpdates,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[supabase] updateProfileAction failed", error.message);
    return { error: error.message };
  }

  revalidatePath("/account");
  return { success: "Profile saved." };
}

export async function upsertAddressAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const id = (formData.get("id") ?? "").toString() || null;
  const label = requireString(formData, "label") || "Home";
  const fullName = requireString(formData, "full_name");
  const phone = requireString(formData, "phone");
  const line1 = requireString(formData, "address_line_1");
  const line2 = requireString(formData, "address_line_2");
  const suburb = requireString(formData, "suburb");
  const city = requireString(formData, "city");
  const province = requireString(formData, "province");
  const postalCode = requireString(formData, "postal_code");
  const country = requireString(formData, "country") || "South Africa";
  const isDefault = formData.get("is_default") === "on";

  if (!fullName) return { error: "Enter the recipient name." };
  if (!line1) return { error: "Enter an address line." };
  if (!city) return { error: "Enter a city." };
  if (!postalCode) return { error: "Enter a postal code." };

  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const payload = {
    user_id: user.id,
    label,
    full_name: fullName,
    phone: phone || null,
    address_line_1: line1,
    address_line_2: line2 || null,
    suburb: suburb || null,
    city,
    province: province || null,
    postal_code: postalCode,
    country,
    is_default: isDefault,
  };

  if (id) {
    const { error } = await supabase
      .from("addresses")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("addresses").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/account");
  return { success: "Delivery address saved." };
}

export async function deleteAddressAction(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = (formData.get("id") ?? "").toString();
  if (!id) return;

  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account");
}

export async function setDefaultAddressAction(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = (formData.get("id") ?? "").toString();
  if (!id) return;

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/account");
}
