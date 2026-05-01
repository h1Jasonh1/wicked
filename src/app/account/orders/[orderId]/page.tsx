import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { SummaryLine } from "@/components/ui/SummaryLine";
import { formatPrice } from "@/lib/formatters";
import { getOrderById } from "@/lib/orders";
import styles from "@/styles/store.module.css";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;

  return {
    title: `${orderId} | WICKED Order Tracking`,
  };
}

export default async function AccountOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className={styles.dashboardStack}>
      <OrderTracker order={order} />
      <section className={styles.accountPanel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>Items</span>
            <h2>Order details</h2>
          </div>
          <span className={styles.statusPill}>{order.status}</span>
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
    </div>
  );
}
