import type { Metadata } from "next";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { AddressBook } from "@/components/account/AddressBook";
import { loadCurrentUser } from "@/lib/supabase/profile";

export const metadata: Metadata = {
  title: "Profile | SOO",
  description:
    "Edit SOO account profile details, delivery defaults, and preferences.",
};

export default async function AccountPage() {
  const user = await loadCurrentUser();

  return (
    <>
      <AccountProfileForm serverUser={user} />
      <AddressBook serverUser={user} />
    </>
  );
}
