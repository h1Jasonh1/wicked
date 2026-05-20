import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Handles the redirect from Supabase email links (signup confirmation
 * and password recovery). Supabase appends `?code=<one-time-token>` to
 * the redirect URL; we exchange it server-side so the auth cookies are
 * written before the user reaches the destination page.
 *
 * The `next` query param is the in-app destination — for confirmation
 * it's typically /account, for password recovery /auth/reset-password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Missing confirmation code")}`,
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Auth is not configured")}`,
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/" + next}`);
}
