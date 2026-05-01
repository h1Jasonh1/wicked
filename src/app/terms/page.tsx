import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | WICKED",
  description:
    "WICKED terms of service for orders, pricing, product information, returns and account use.",
};

export default function TermsPage() {
  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Terms of Service</span>
        <h1>Clear terms for a clean purchase.</h1>
        <p>
          These terms frame how WICKED handles orders, pricing, product
          information, returns, and customer account use.
        </p>
      </section>
      <section className={styles.policyGrid}>
        {[
          ["Orders", "Orders are accepted once payment is authorised and stock is confirmed. WICKED may contact customers to resolve address or payment issues."],
          ["Product information", "We aim to present accurate pricing, imagery, sizes, ingredients, usage notes, and formula information. Minor visual variation can occur across displays."],
          ["Support and policies", "Delivery, returns, refunds, and privacy pages form part of the customer agreement and should be reviewed before purchase."],
        ].map(([title, text]) => (
          <article className={styles.policyCard} key={title}>
            <Icon name="check" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className={styles.section}>
        <Link className={styles.primaryButton} href="/shop">
          Continue shopping
          <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
