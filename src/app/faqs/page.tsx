import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import styles from "@/app/components/Store.module.css";

export const metadata: Metadata = {
  title: "FAQs | WICKED",
  description:
    "Frequently asked questions about WICKED skincare, delivery, returns, routines and checkout.",
};

const faqs = [
  ["How do I build a routine?", "Start with cleanser, add one targeted serum, seal with moisturiser, and finish mornings with SPF. Product pages explain where each WICKED formula fits."],
  ["Can I save products for later?", "Yes. Use the heart icon to add skincare to your saved routine. Your wishlist count is visible in the navigation."],
  ["Is checkout secure?", "The checkout preview is designed for encrypted payment entry, clear VAT-inclusive totals, and trusted card or wallet methods."],
  ["When do new releases arrive?", "WICKED releases are focused and edited. Join Skin Notes for early access, restock timing, and routine guidance."],
  ["What if my item arrives damaged?", "Contact support within 72 hours with your order number and images. We will arrange a replacement, refund, or return label where appropriate."],
];

export default function FaqsPage() {
  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>FAQs</span>
        <h1>Answers before you commit.</h1>
        <p>
          Clear information for sizing, shipping, returns, checkout, and care.
          If a question is specific to your order, support can help directly.
        </p>
        <Link className={styles.primaryButton} href="/contact">
          Contact support
          <Icon name="arrow" />
        </Link>
      </section>
      <section className={styles.section}>
        <div className={styles.accordion}>
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}</summary>
              <div className={styles.accordionContent}>
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
