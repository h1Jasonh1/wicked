import Link from "next/link";
import type { Order } from "@/types/order";
import { formatPrice } from "@/lib/formatters";
import styles from "@/styles/store.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function OrderHistoryList({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return (
      <div className={styles.emptyState}>
        <div>
          <h3>No orders yet.</h3>
          <p className={styles.mutedText}>
            Your order history will appear here after authenticated checkout is
            connected to the order backend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderList}>
      {orders.map((order) => (
        <article className={styles.orderCard} key={order.id}>
          <div>
            <span className={styles.eyebrow}>{order.id}</span>
            <h3>{order.status}</h3>
            <p className={styles.mutedText}>
              {order.quantity} items placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className={styles.orderCardMeta}>
            <strong>{formatPrice(order.total)}</strong>
            <span>{order.paymentStatus}</span>
          </div>
          <Link className={styles.secondaryButton} href={`/account/orders/${order.id}`}>
            View order
          </Link>
        </article>
      ))}
    </div>
  );
}
