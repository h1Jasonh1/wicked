import type { Metadata } from "next";
import { AccountSettingsPanel } from "@/components/account/AccountSettingsPanel";
import { loadCurrentUser } from "@/lib/supabase/profile";

export const metadata: Metadata = {
  title: "Profile Settings | SOO",
};

export default async function AccountSettingsPage() {
  const user = await loadCurrentUser();
  return <AccountSettingsPanel serverUser={user} />;
}
