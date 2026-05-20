import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact SOO | Skincare Support",
  description:
    "Contact SOO support for skincare guidance, order questions, delivery help and returns.",
};

export default function ContactPage() {
  return <ContactClient />;
}
