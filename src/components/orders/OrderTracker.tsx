import type { Order, OrderStatus } from "@/types/order";
import { orderStatuses } from "@/lib/orders";
import styles from "@/styles/store.module.css";

const deliveryFlow: OrderStatus[] = orderStatuses.slice(0, 7);

function formatDate(value?: string) {
  if (!value) {
    return "Not available yet";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function OrderTracker({ order }: { order: Order }) {
  const statusIndex = deliveryFlow.indexOf(order.status);
  const isExceptionStatus = statusIndex === -1;

  return (
    <section className={styles.orderTracker}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.eyebrow}>Order tracker</span>
          <h2>{order.status}</h2>
        </div>
        <span className={styles.statusPill}>{order.paymentStatus}</span>
      </div>
      <div className={styles.trackingMetaGrid}>
        <div>
          <span>Courier</span>
          <strong>{order.trackingProvider ?? "Manual status updates"}</strong>
        </div>
        <div>
          <span>Tracking number</span>
          <strong>{order.trackingNumber ?? "Pending dispatch"}</strong>
        </div>
        <div>
          <span>Estimated delivery</span>
          <strong>{formatDate(order.estimatedDelivery)}</strong>
        </div>
        <div>
          <span>Last updated</span>
          <strong>{formatDate(order.updatedAt)}</strong>
        </div>
      </div>
      <div className={styles.orderTimeline}>
        {(isExceptionStatus ? [order.status] : deliveryFlow).map((status, index) => {
          const isComplete = !isExceptionStatus && index < statusIndex;
          const isCurrent = isExceptionStatus || index === statusIndex;

          return (
            <div
              className={`${styles.timelineStep} ${
                isComplete ? styles.timelineStepComplete : ""
              } ${isCurrent ? styles.timelineStepCurrent : ""}`}
              key={status}
            >
              <span>{index + 1}</span>
              <div>
                <strong>{status}</strong>
                <small>
                  {isCurrent ? "Current status" : isComplete ? "Completed" : "Pending"}
                </small>
              </div>
            </div>
          );
        })}
      </div>
      <a className={styles.secondaryButton} href={order.trackingUrl ?? "#"}>
        Tracking link placeholder
      </a>
    </section>
  );
}
