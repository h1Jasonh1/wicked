import type { Metadata } from "next";
import { CheckoutRoute } from "@/components/auth/CheckoutRoute";

export const metadata: Metadata = {
  title: "Checkout | WICKED",
  description:
    "Account-gated WICKED checkout placeholder prepared for future payment and order backends.",
};

export default function CheckoutPage() {
  return <CheckoutRoute />;
}
