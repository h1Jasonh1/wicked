import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact WICKED | Skincare Support",
  description:
    "Contact WICKED support for skincare guidance, order questions, delivery help and returns.",
};

export default function ContactPage() {
  return <ContactClient />;
}
