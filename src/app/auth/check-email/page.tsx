import type { Metadata } from "next";
import { CheckEmailPanel } from "@/components/auth/CheckEmailPanel";

export const metadata: Metadata = {
  title: "Check your email | SOO",
  description:
    "Confirm your SOO account by clicking the link we just emailed you.",
};

type Props = {
  searchParams: Promise<{ email?: string; next?: string }>;
};

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email, next } = await searchParams;
  return <CheckEmailPanel email={email ?? ""} next={next ?? "/account"} />;
}
