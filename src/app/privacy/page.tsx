import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | SOO",
  description:
    "SOO privacy policy covering checkout, support and analytics information.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Privacy Policy</span>
        <h1>Respect for customer information.</h1>
        <p>
          SOO handles checkout, support, and analytics data with restraint,
          clear consent, and only the information needed to serve the customer.
        </p>
      </section>
      <section className={styles.policyGrid}>
        {[
          ["Information collected", "Contact details, delivery information, payment status, support messages, and shopping preferences needed to complete the skincare customer experience."],
          ["How it is used", "To process orders, provide support, improve product availability, prevent fraud, and send account or order communications where requested."],
          ["Customer control", "Customers may request access, correction, or deletion of eligible information through support."],
        ].map(([title, text]) => (
          <article className={styles.policyCard} key={title}>
            <Icon name="shield" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className={styles.section}>
        <Link className={styles.primaryButton} href="/contact">
          Ask about privacy
          <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
