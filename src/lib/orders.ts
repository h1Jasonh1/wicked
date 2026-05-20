import type { OrderStatus } from "@/types/order";

export const orderStatuses: OrderStatus[] = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];
