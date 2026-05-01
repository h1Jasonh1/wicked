import type { Product } from "./product";

export type OrderStatus =
  | "Order Placed"
  | "Payment Confirmed"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Refunded";

export type PaymentStatus =
  | "Pending"
  | "Authorised"
  | "Paid"
  | "Failed"
  | "Refunded";

export type TrackingProvider =
  | "Manual"
  | "Bob Go"
  | "Courier API"
  | "Future Partner";

export type OrderCustomerDetails = {
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  price: number;
  imageAlt?: string;
};

export type Order = {
  id: string;
  userId: string;
  customer: OrderCustomerDetails;
  items: OrderItem[];
  quantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingProvider?: TrackingProvider;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingStatusSnapshot = {
  orderId: string;
  provider?: TrackingProvider;
  trackingNumber?: string;
  trackingUrl?: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  lastUpdated: string;
  source: "manual" | "courier-api-placeholder";
};

export function toOrderItem(product: Product, quantity: number): OrderItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    quantity,
    price: product.price,
    imageAlt: product.imageAlt,
  };
}
