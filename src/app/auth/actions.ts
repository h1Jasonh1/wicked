"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
  /**
   * Surfaced on sign-in when Supabase reports the email is not yet
   * confirmed. The form uses this to render a "Resend confirmation"
   * action without forcing the user to start over.
   */
  needsConfirmation?: boolean;
  /** Echoed back when needsConfirmation is true so resend has the address. */
  email?: string;
} | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value);
}

/**
 * Build an absolute origin from the incoming request headers. Supabase
 * needs an absolute URL for emailRedirectTo / redirectTo. Falls back to
 * NEXT_PUBLIC_SITE_URL when behind a proxy that strips host headers.
 */
async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = h.get("host");
  const proto =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// =====================================================================
// Sign up — sends a Supabase confirmation email and routes the user to
// /auth/check-email regardless of project configuration. If Supabase is
// configured to skip confirmation we still land them on the explainer
// page; the resend button is harmless and the next sign-in will work.
// =====================================================================
export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirm_password") ?? "").toString();
  const fullName = (formData.get("full_name") ?? "").toString().trim();
  const next = (formData.get("next") ?? "/account").toString();

  if (!fullName) {
    return { error: "Enter your full name." };
  }
  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      error: "Authentication is not configured. Add Supabase env variables.",
    };
  }

  const origin = await getSiteOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // Confirmation link routes through the callback route so we can
      // exchange the code for a session before the user hits a UI page.
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

// =====================================================================
// Sign in — surfaces "Email not confirmed" as a structured state so the
// form can offer a resend action instead of a dead-end error.
// =====================================================================
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const next = (formData.get("next") ?? "/account").toString();

  if (!isValidEmail(email) || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      error: "Authentication is not configured. Add Supabase env variables.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase returns "Email not confirmed" when the user hasn't clicked
    // the confirmation link yet. Surface that as a recoverable state so
    // the form can show a resend button.
    const isUnconfirmed =
      error.message.toLowerCase().includes("email not confirmed") ||
      error.message.toLowerCase().includes("confirm");
    if (isUnconfirmed) {
      return {
        error:
          "Please confirm your email before signing in. Check your inbox or resend the confirmation link below.",
        needsConfirmation: true,
        email,
      };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

// =====================================================================
// Resend the signup confirmation email. Used by /auth/check-email and
// the unconfirmed-sign-in error state. Cooldown is enforced client-side
// (60s); the server still calls Supabase, which has its own rate limit.
// =====================================================================
export async function resendConfirmationAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const next = (formData.get("next") ?? "/account").toString();

  if (!isValidEmail(email)) {
    return { error: "Enter the email you signed up with." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const origin = await getSiteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "Confirmation email sent. Check your inbox." };
}

// =====================================================================
// Forgot password — sends a magic link that lands on /auth/callback,
// which exchanges the code for a (recovery) session and forwards to
// /auth/reset-password where the user picks a new password.
// =====================================================================
export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") ?? "").toString().trim();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const origin = await getSiteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
      "/auth/reset-password",
    )}`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message:
      "If an account exists for that email, a reset link is on its way. The link expires in one hour.",
  };
}

// =====================================================================
// Update password — used after the user clicks the reset link and the
// callback route has signed them in with a recovery session.
// =====================================================================
export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirm_password") ?? "").toString();

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Reset link expired or already used. Request a new one to continue.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}
