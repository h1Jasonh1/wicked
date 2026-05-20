import type { Metadata } from "next";
import { CheckoutRoute } from "@/components/auth/CheckoutRoute";

export const metadata: Metadata = {
  title: "Checkout | SOO",
  description:
    "Account-gated SOO checkout placeholder prepared for future payment and order backends.",
};

export default function CheckoutPage() {
  return <CheckoutRoute />;
}
