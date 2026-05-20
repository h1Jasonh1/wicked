import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password | SOO",
  description: "Send a password reset link to your SOO account email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
