import type { Metadata } from "next";
import Link from "next/link";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { sampleOrders } from "@/lib/orders";
import styles from "@/styles/store.module.css";

export const metadata: Metadata = {
  title: "Order Confirmation | WICKED",
};

export default function OrderConfirmationPage() {
  const order = sampleOrders[0];

  return (
    <main className={styles.accountPage}>
      <section className={styles.routeHeroPanel}>
        <span className={styles.eyebrow}>Confirmation</span>
        <h1>Order confirmation placeholder</h1>
        <p className={styles.mutedText}>
          This page is prepared for the post-payment order confirmation flow.
          It will receive a real order id after payment and order APIs are
          connected.
        </p>
        <div className={styles.formActions}>
          <Link className={styles.primaryButton} href={`/account/orders/${order.id}`}>
            View order tracker
          </Link>
          <Link className={styles.secondaryButton} href="/shop">
            Continue shopping
          </Link>
        </div>
      </section>
      <OrderTracker order={order} />
    </main>
  );
}
