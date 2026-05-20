import type {
  OrderStatus,
  TrackingProvider,
  TrackingStatusSnapshot,
} from "@/types/order";
import { loadOrderByNumber } from "@/lib/supabase/orders";

export type CourierStatusUpdate = {
  provider: TrackingProvider;
  trackingNumber: string;
  status: OrderStatus;
  trackingUrl?: string;
  estimatedDelivery?: string;
  lastUpdated: string;
};

export async function getTrackingStatus(
  orderNumber: string,
): Promise<TrackingStatusSnapshot | null> {
  const order = await loadOrderByNumber(orderNumber);

  if (!order) {
    return null;
  }

  return {
    orderId: order.id,
    provider: order.trackingProvider,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    status: order.status,
    estimatedDelivery: order.estimatedDelivery,
    lastUpdated: order.updatedAt,
    source: "manual",
  };
}

export async function syncCourierStatus(
  trackingNumber: string,
  provider: TrackingProvider,
): Promise<CourierStatusUpdate> {
  // TODO(tracking): Connect provider credentials, webhook signature checks,
  // and API clients here. Bob Go or any future courier should be implemented
  // behind this abstraction rather than wired directly into UI components.
  return {
    provider,
    trackingNumber,
    status: "Dispatched",
    trackingUrl: "#",
    lastUpdated: new Date().toISOString(),
  };
}
