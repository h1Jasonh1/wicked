import type { Metadata } from "next";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile | WICKED",
  description:
    "Edit WICKED account profile details, delivery defaults, and preferences.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  return <AccountProfileForm serverUser={user} />;
}
