import type { Metadata } from "next";
import { AccountSettingsPanel } from "@/components/account/AccountSettingsPanel";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile Settings | WICKED",
};

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();

  return <AccountSettingsPanel serverUser={user} />;
}
