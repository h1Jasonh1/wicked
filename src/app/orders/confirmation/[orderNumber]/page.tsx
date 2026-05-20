import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnPaid } from "@/components/orders/ClearCartOnPaid";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { PaymentStatusPoller } from "@/components/orders/PaymentStatusPoller";
import { RetryPaymentButton } from "@/components/orders/RetryPaymentButton";
import { SummaryLine } from "@/components/ui/SummaryLine";
import { formatPrice } from "@/lib/formatters";
import { loadOrderByNumber } from "@/lib/supabase/orders";
import styles from "@/styles/store.module.css";

type ConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ payfast?: string }>;
};

export async function generateMetadata({
  params,
}: ConfirmationPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `${orderNumber} | SOO Order Confirmation` };
}

export default async function OrderConfirmationByNumberPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const [{ orderNumber }, { payfast: payfastFlag }] = await Promise.all([
    params,
    searchParams,
  ]);

  const order = await loadOrderByNumber(orderNumber);
  if (!order) {
    notFound();
  }

  // Three terminal-ish states drive the headline. Paid is the happy path;
  // Failed and Cancelled both surface a retry CTA. Pending after a PayFast
  // success redirect means the ITN is still in flight — poll briefly.
  const isPaid = order.paymentStatus === "Paid";
  const isFailed = order.paymentStatus === "Failed";
  const isCancelled = payfastFlag === "cancelled" && !isPaid;
  const isAwaitingItn = payfastFlag === "success" && !isPaid && !isFailed;

  return (
    <main className={styles.accountPage}>
      <section className={styles.routeHeroPanel}>
        <span className={styles.eyebrow}>Confirmation</span>
        <h1>Order {order.id}</h1>
        {isPaid ? (
          <p className={styles.mutedText}>
            Payment received. We&rsquo;ll email tracking once dispatch is
            confirmed.
          </p>
        ) : isCancelled ? (
          <p className={styles.mutedText}>
            Payment was cancelled. Your cart has been kept — you can retry
            payment below.
          </p>
        ) : isFailed ? (
          <p className={styles.mutedText}>
            Payment failed. Your cart has been kept — you can retry payment
            below.
          </p>
        ) : isAwaitingItn ? (
          <p className={styles.mutedText}>
            Processing payment&hellip; this usually takes a few seconds. This
            page will update automatically.
          </p>
        ) : (
          <p className={styles.mutedText}>
            Your order has been recorded. Payment status:{" "}
            {order.paymentStatus}.
          </p>
        )}
        <div className={styles.formActions}>
          {isPaid ? (
            <Link
              className={styles.primaryButton}
              href={`/account/orders/${order.id}`}
            >
              View order tracker
            </Link>
          ) : isFailed || isCancelled ? (
            <RetryPaymentButton orderNumber={order.id} />
          ) : (
            <Link className={styles.primaryButton} href="/shop">
              Continue shopping
            </Link>
          )}
          <Link className={styles.secondaryButton} href="/shop">
            Continue shopping
          </Link>
        </div>
      </section>
      {isAwaitingItn ? <PaymentStatusPoller /> : null}
      {isPaid ? <ClearCartOnPaid orderId={order.id} /> : null}
      <OrderTracker order={order} />
      <section className={styles.accountPanel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>Items</span>
            <h2>What you ordered</h2>
          </div>
          <span className={styles.statusPill}>{order.paymentStatus}</span>
        </div>
        {order.items.map((item) => (
          <SummaryLine
            key={`${order.id}-${item.productId}`}
            label={`${item.name} x ${item.quantity}`}
            value={formatPrice(item.price * item.quantity)}
          />
        ))}
        <SummaryLine label="Subtotal" value={formatPrice(order.subtotal)} />
        <SummaryLine
          label="Delivery"
          value={order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}
        />
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </section>
    </main>
  );
}
