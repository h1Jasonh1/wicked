import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import styles from "@/app/components/Store.module.css";

export const metadata: Metadata = {
  title: "Returns & Refunds | WICKED",
  description:
    "WICKED skincare returns, refunds, exchange process and eligibility information.",
};

export default function ReturnsPage() {
  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Returns and refunds</span>
        <h1>Considered returns, clearly handled.</h1>
        <p>
          We keep the process direct: clear hygiene rules, assisted support, and
          refund timelines that do not hide behind legal language.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/shop">
            Back to shop
            <Icon name="arrow" />
          </Link>
          <Link className={styles.secondaryButton} href="/contact">
            Contact support
          </Link>
        </div>
      </section>

      <section className={styles.policyGrid}>
        {[
          ["Return window", "Unopened skincare may be returned within 14 days of delivery."],
          ["Eligibility", "Products must be sealed, unused, unmarked, and returned with original cartons and protective packaging."],
          ["Refund timing", "Approved refunds are processed to the original payment method within 5 to 10 business days after inspection."],
        ].map(([title, text]) => (
          <article className={styles.policyCard} key={title}>
            <Icon name="return" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Policy details</span>
          <h2>What qualifies.</h2>
        </div>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}>
            <h3>Non-returnable items</h3>
            <ul>
              <li>Opened or used skincare products.</li>
              <li>Products without hygiene seals or original cartons.</li>
              <li>Final sale bundles where marked at purchase.</li>
              <li>Items without original packaging or proof of purchase.</li>
            </ul>
          </article>
          <article className={styles.policyCard}>
            <h3>Exchanges</h3>
            <p>
              Exchanges are handled as assisted returns. We reserve the requested
              formula option where stock allows and dispatch after the original
              sealed item is approved.
            </p>
          </article>
          <article className={styles.policyCard}>
            <h3>Damaged or incorrect items</h3>
            <p>
              Contact support within 72 hours with order number and images. We
              will arrange a replacement, refund, or return label where
              appropriate.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Return FAQ</span>
          <h2>Before you send it back.</h2>
        </div>
        <div className={styles.accordion}>
          <details open>
            <summary>How do I start a return?</summary>
            <div className={styles.accordionContent}>
              <p>
                Use the contact page with your order number, item name, and
                return reason. Support will confirm skincare eligibility before
                you ship.
              </p>
            </div>
          </details>
          <details>
            <summary>Are return shipping costs covered?</summary>
            <div className={styles.accordionContent}>
              <p>
                Return shipping is covered for incorrect or damaged items.
                Preference-based returns may have the label cost deducted from
                the refund.
              </p>
            </div>
          </details>
          <details>
            <summary>When will I see my refund?</summary>
            <div className={styles.accordionContent}>
              <p>
                Once inspected and approved, refunds are issued within 5 to 10
                business days depending on the payment provider.
              </p>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
