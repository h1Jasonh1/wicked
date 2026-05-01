import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Delivery Information | WICKED",
  description:
    "Delivery options, processing times, tracking information and shipping costs for WICKED skincare orders.",
};

const deliveryOptions = [
  {
    title: "Fast South Africa Delivery",
    text: "2 to 4 business days after dispatch. Free on orders over R750, otherwise R95.",
  },
  {
    title: "Priority Dispatch",
    text: "1 to 2 business days after dispatch for eligible metro addresses. Estimated at R165.",
  },
  {
    title: "Protected Packaging",
    text: "Skincare ships in recyclable protective packaging with tamper-evident product seals.",
  },
];

export default function DeliveryPage() {
  return (
    <main className={styles.policyPage}>
      <section className={styles.policyHero}>
        <span className={styles.eyebrow}>Delivery information</span>
        <h1>Fast delivery, careful skincare handling.</h1>
        <p>
          WICKED orders are packed to protect bottles, jars, and tubes in
          transit. Delivery, VAT, and totals are shown clearly before checkout.
        </p>
        <Link className={styles.primaryButton} href="/shop">
          Back to shop
          <Icon name="arrow" />
        </Link>
      </section>

      <section className={styles.policyGrid}>
        {deliveryOptions.map((option) => (
          <article className={styles.policyCard} key={option.title}>
            <Icon name="truck" />
            <h3>{option.title}</h3>
            <p>{option.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>What to expect</span>
          <h2>Processing and tracking.</h2>
        </div>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}>
            <h3>Processing time</h3>
            <p>
              Most orders leave our studio within 24 hours on business days.
              Bundles or launch-week volume may require one additional day.
            </p>
          </article>
          <article className={styles.policyCard}>
            <h3>Tracking</h3>
            <p>
              Tracking is sent by email once the parcel is scanned by the
              carrier. Some higher-value skincare bundles may require a
              signature on delivery.
            </p>
          </article>
          <article className={styles.policyCard}>
            <h3>Split shipments</h3>
            <p>
              If a bundle includes items from different fulfilment windows, we
              may ship separately and keep the delivery cost unchanged.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Delivery FAQ</span>
          <h2>Practical answers before checkout.</h2>
        </div>
        <div className={styles.accordion}>
          <details open>
            <summary>When is shipping complimentary?</summary>
            <div className={styles.accordionContent}>
              <p>
                Standard South Africa delivery is free on orders over R750 after
                discounts. The cart applies this automatically.
              </p>
            </div>
          </details>
          <details>
            <summary>Do you ship internationally?</summary>
            <div className={styles.accordionContent}>
              <p>
                WICKED currently focuses on South Africa delivery. International
                availability will be announced on the website when it is ready.
              </p>
            </div>
          </details>
          <details>
            <summary>Can I change the delivery address?</summary>
            <div className={styles.accordionContent}>
              <p>
                Contact support as soon as possible. Address changes are only
                possible before dispatch.
              </p>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
