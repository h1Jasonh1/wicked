"use server";

import { after } from "next/server";
import { sendContactMessageEmail } from "@/lib/email/sendContactMessage";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitContactMessageAction(
  formData: FormData,
): Promise<ContactSubmitResult> {
  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const phone = (formData.get("phone") ?? "").toString().trim();
  const subject = (formData.get("subject") ?? "").toString().trim();
  const orderReference = (formData.get("order") ?? "").toString().trim();
  const message = (formData.get("message") ?? "").toString().trim();

  if (!name) return { ok: false, error: "Enter your name." };
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (message.length < 12) {
    return {
      ok: false,
      error: "Add a little more detail so support can help.",
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Add env variables to enable contact submissions.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    subject: subject || null,
    order_reference: orderReference || null,
    message,
    user_id: user?.id ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Fire-and-forget notification to the support inbox. Runs after the
  // response is sent so a slow Resend call never delays the form UX, and
  // a send failure never blocks a successful Supabase insert.
  after(() =>
    sendContactMessageEmail({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      orderReference: orderReference || null,
      message,
      submittedAt: new Date(),
    }),
  );

  return { ok: true };
}
