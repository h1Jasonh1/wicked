import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a new password | SOO",
};

export default async function ResetPasswordPage() {
  // The user only reaches this page after the callback exchanged their
  // recovery code for a session. If there's no session here, the link
  // is stale or someone landed on the page directly — push them to the
  // forgot-password screen rather than failing in the action.
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/auth/forgot-password");
    }
  }

  return <ResetPasswordForm />;
}
